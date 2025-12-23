import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin, updateRetrospectiveAdmin } from '@/lib/db-admin';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAsaasWebhookSignature } from '@/lib/asaas';

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id?: string;
    customer?: string;
    billingType?: string;
    value?: number;
    netValue?: number;
    status?: string;
    dueDate?: string;
    paymentDate?: string;
    description?: string;
    externalReference?: string;
  };
  paymentId?: string;
  customer?: string;
  billingType?: string;
  value?: number;
  status?: string;
  externalReference?: string;
}

export async function POST(request: NextRequest) {
  try {
    logger.log('📥 Asaas webhook received');
    
    const signature = request.headers.get('asaas-access-token') || 
                     request.headers.get('x-asaas-signature') ||
                     request.headers.get('access-token');
    
    const body = await request.text();
    
    // Verify signature if token is configured
    if (signature && process.env.ASAAS_WEBHOOK_TOKEN) {
      if (!verifyAsaasWebhookSignature(body, signature)) {
        logger.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      logger.log('✅ Webhook signature verified');
    } else {
      logger.warn('⚠️ ASAAS_WEBHOOK_TOKEN not configured, skipping signature verification');
    }

    let payload: AsaasWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook payload:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    logger.log('📋 Webhook payload:', {
      event: payload.event,
      paymentId: payload.payment?.id || payload.paymentId,
      status: payload.payment?.status || payload.status,
    });

    // Handle payment confirmation events
    const eventType = payload.event;
    const isPaid = eventType === 'PAYMENT_CONFIRMED' || 
                   eventType === 'PAYMENT_RECEIVED' ||
                   payload.payment?.status === 'CONFIRMED' ||
                   payload.payment?.status === 'RECEIVED' ||
                   payload.status === 'CONFIRMED' ||
                   payload.status === 'RECEIVED';

    if (isPaid) {
      logger.log('💰 Payment confirmed');
      
      // Extract metadata from externalReference
      let metadata: any = {};
      const externalRef = payload.payment?.externalReference || payload.externalReference;
      
      if (externalRef) {
        try {
          metadata = JSON.parse(externalRef);
        } catch {
          // If not JSON, treat as simple string
          metadata = { userId: externalRef, retrospectiveId: externalRef };
        }
      }

      const userId = metadata.userId;
      const retrospectiveId = metadata.retrospectiveId;
      const credits = metadata.credits;
      const type = metadata.type;

      // Handle credits purchase
      if (type === 'credits' && userId && credits) {
        logger.log('🎫 Adding credits to user:', userId);
        logger.log('🎫 Credits to add:', credits);

        const creditsRef = doc(db, 'credits', userId);
        const creditsDoc = await getDoc(creditsRef);

        const creditsToAdd = parseInt(credits.toString(), 10);

        if (creditsDoc.exists()) {
          const currentCredits = creditsDoc.data().credits || 0;
          await updateDoc(creditsRef, {
            credits: currentCredits + creditsToAdd,
          });
          logger.log('✅ Credits updated:', currentCredits + creditsToAdd);
        } else {
          await setDoc(creditsRef, {
            credits: creditsToAdd,
          });
          logger.log('✅ Credits document created with:', creditsToAdd);
        }
      }

      // Handle retrospective payment (if needed in the future)
      if (type === 'retrospective' && retrospectiveId) {
        logger.log('📝 Processing retrospective payment:', retrospectiveId);
        
        const retrospective = await getRetrospectiveAdmin(retrospectiveId);
        
        if (retrospective && retrospective.zipFileUrl) {
          // Trigger retrospective processing
          const baseUrl = request.nextUrl.origin;
          const processUrl = `${baseUrl}/api/process-retrospective`;
          
          logger.log('🚀 Triggering retrospective processing:', processUrl);
          
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
        }
      }
    } else {
      logger.log('ℹ️ Webhook event is not a payment confirmation:', eventType);
    }

    return NextResponse.json({ 
      received: true, 
      status: 'success',
      processed: isPaid,
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

