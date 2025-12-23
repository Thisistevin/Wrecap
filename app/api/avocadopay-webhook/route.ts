import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin, updateRetrospectiveAdmin } from '@/lib/db-admin';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

interface AvocadoPayWebhookPayload {
  event?: string;
  type?: string;
  status?: string;
  metadata?: {
    retrospectiveId?: string;
    userId?: string;
  };
  data?: {
    metadata?: {
      retrospectiveId?: string;
      userId?: string;
    };
  };
  id?: string;
  amount?: number;
  currency?: string;
}

// Verify webhook signature using HMAC SHA256
function verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // AvocadoPay typically uses HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.log('📥 AvocadoPay webhook received');
    
    const signature = request.headers.get('x-avocadopay-signature') || 
                     request.headers.get('x-signature') ||
                     request.headers.get('signature') ||
                     request.headers.get('x-webhook-signature');
    
    const body = await request.text();
    const secret = process.env.AVOCADOPAY_WEBHOOK_SECRET || '';

    // Verify signature if secret is configured
    if (secret) {
      if (!signature || !verifyWebhookSignature(signature, body, secret)) {
        logger.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      logger.log('✅ Webhook signature verified');
    } else {
      logger.warn('⚠️ AVOCADOPAY_WEBHOOK_SECRET not configured, skipping signature verification');
    }

    let payload: AvocadoPayWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook payload:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    logger.log('📋 Webhook payload:', {
      event: payload.event || payload.type,
      status: payload.status,
      id: payload.id,
    });

    // Extract retrospectiveId from various possible locations
    const retrospectiveId = payload.metadata?.retrospectiveId || 
                           payload.data?.metadata?.retrospectiveId ||
                           payload.metadata?.retrospectiveId;

    // Handle different webhook event types
    const eventType = payload.event || payload.type || payload.status;
    const isPaid = eventType === 'billing.paid' || 
                   eventType === 'payment.paid' ||
                   eventType === 'paid' ||
                   payload.status === 'paid';

    if (isPaid && retrospectiveId) {
      logger.log('💰 Payment confirmed for retrospective:', retrospectiveId);
      
      const retrospective = await getRetrospectiveAdmin(retrospectiveId);
      
      if (!retrospective) {
        logger.error('❌ Retrospective not found:', retrospectiveId);
        return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
      }

      // Update retrospective status to paid
      try {
        await updateRetrospectiveAdmin(retrospectiveId, {
          paymentStatus: 'paid',
          paidAt: new Date(),
        });
        logger.log('✅ Updated retrospective payment status');
      } catch (updateError) {
        logger.error('❌ Failed to update payment status:', updateError);
      }

      if (retrospective.zipFileUrl) {
        // Trigger retrospective processing
        const baseUrl = request.nextUrl.origin;
        const processUrl = `${baseUrl}/api/process-retrospective`;
        
        logger.log('🚀 Triggering retrospective processing:', processUrl);
        
        // Don't await - process in background to avoid timeout
        fetch(processUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            retrospectiveId,
            zipFileUrl: retrospective.zipFileUrl,
          }),
        })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            logger.error('❌ Failed to trigger processing:', response.status, errorText);
          } else {
            logger.log('✅ Processing triggered successfully');
          }
        })
        .catch(err => {
          logger.error('❌ Background processing error:', err);
        });
      } else {
        logger.warn('⚠️ No zipFileUrl found for retrospective:', retrospectiveId);
      }
    } else if (!isPaid) {
      logger.log('ℹ️ Webhook event is not a payment confirmation:', eventType);
    } else {
      logger.warn('⚠️ Payment confirmed but no retrospectiveId found in payload');
    }

    return NextResponse.json({ 
      received: true, 
      status: 'success',
      processed: isPaid && !!retrospectiveId,
    });
  } catch (error: any) {
    logger.error('❌ Webhook error:', error);
    logger.error('❌ Error stack:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      received: true,
    }, { status: 500 });
  }
}

