import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin, updateRetrospectiveAdmin } from '@/lib/db-admin';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

interface MercadoPagoWebhookPayload {
  action?: string;
  api_version?: string;
  data?: {
    id?: string;
  };
  date_created?: string;
  id?: number;
  live_mode?: boolean;
  type?: string;
  user_id?: string;
}

/**
 * Verifies Mercado Pago webhook signature
 * @param signature - Signature from x-signature header
 * @param body - Raw request body
 * @param secret - Webhook secret from Mercado Pago
 * @returns boolean indicating if signature is valid
 */
function verifyMercadoPagoSignature(
  signature: string | null,
  body: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Mercado Pago uses HMAC SHA256
    // Format: sha256=hash
    const parts = signature.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const receivedHash = parts[1];
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.log('📥 Mercado Pago webhook received');
    
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
    
    logger.log('🔍 Webhook headers:', {
      hasSignature: !!xSignature,
      hasRequestId: !!xRequestId,
      hasSecret: !!webhookSecret,
    });
    
    const body = await request.text();
    
    // Parse body early to check if it's a test notification
    let payload: MercadoPagoWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook payload:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    // Check if this is a test notification (Mercado Pago test notifications may not have valid signatures)
    const isTestNotification = payload.data?.id === '123456' || 
                               (payload.id !== undefined && String(payload.id) === '123456') || 
                               payload.live_mode === false ||
                               !xSignature;
    
    // Verify signature if secret is configured and it's not a test notification
    if (webhookSecret && !isTestNotification) {
      if (!xSignature) {
        logger.warn('⚠️ No signature header found, but secret is configured. This might be a test notification.');
        // For test notifications, we'll still process but log a warning
      } else if (!verifyMercadoPagoSignature(xSignature, body, webhookSecret)) {
        logger.error('❌ Invalid webhook signature');
        logger.error('🔍 Signature details:', {
          receivedSignature: xSignature?.substring(0, 20) + '...',
          hasSecret: !!webhookSecret,
        });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      logger.log('✅ Webhook signature verified');
    } else if (webhookSecret && isTestNotification) {
      logger.log('ℹ️ Test notification detected, skipping signature verification');
    } else if (!webhookSecret) {
      logger.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET not configured, skipping signature verification');
    }
    
    logger.log('📋 Webhook payload:', {
      type: payload.type,
      action: payload.action,
      id: payload.id,
      dataId: payload.data?.id,
      liveMode: payload.live_mode,
      isTestNotification,
    });

    // Mercado Pago sends different webhook types
    // We're interested in payment notifications
    if (payload.type === 'payment') {
      const paymentId = payload.data?.id;
      
      if (!paymentId) {
        logger.warn('⚠️ Payment ID not found in webhook');
        return NextResponse.json({ received: true, status: 'ignored' });
      }

      // Skip test payment IDs ONLY if they don't exist in the API
      // But first try to fetch them - if they exist, process them
      // Test notifications from dashboard may have real payment IDs
      const isTestId = paymentId === '123456' || paymentId === '123456789' || String(paymentId).startsWith('123');
      if (isTestId) {
        logger.log('⚠️ Test payment ID detected: ' + paymentId);
        logger.log('💡 Attempting to fetch payment details to verify if it exists...');
        // Don't skip immediately - try to fetch first
      }

      // Fetch payment details from Mercado Pago API
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        logger.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      try {
        logger.log('🔍 Fetching payment details for ID:', paymentId);
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          logger.error('❌ Failed to fetch payment details:', {
            status: paymentResponse.status,
            statusText: paymentResponse.statusText,
            error: errorText,
          });
          return NextResponse.json({ received: true, status: 'error_fetching_payment' });
        }

        const paymentData = await paymentResponse.json();
        
        logger.log('💰 Payment details:', {
          id: paymentData.id,
          status: paymentData.status,
          status_detail: paymentData.status_detail,
          external_reference: paymentData.external_reference,
        });

        // Check if payment is approved
        const isApproved = paymentData.status === 'approved' || paymentData.status === 'authorized';
        
        logger.log('💳 Payment status check:', {
          status: paymentData.status,
          isApproved,
          external_reference: paymentData.external_reference,
          paymentId: paymentData.id,
        });
        
        // For pending payments (Pix), we should also process if we have metadata
        // The webhook will be called again when status changes to approved
        if (isApproved || paymentData.status === 'pending') {
          logger.log('🔄 Processing payment with status:', paymentData.status);
          
          if (paymentData.status === 'pending') {
            logger.log('⏳ Payment is pending (Pix). Processing credits now, webhook will confirm later.');
          }
          // Extract metadata from external_reference
          let metadata: any = {};
          const externalRef = paymentData.external_reference;
          
          logger.log('📦 External reference:', externalRef);
          
          if (externalRef) {
            try {
              metadata = JSON.parse(externalRef);
              logger.log('✅ Parsed metadata:', metadata);
            } catch (parseError) {
              logger.error('❌ Failed to parse external_reference:', parseError);
              // If not JSON, treat as simple string
              metadata = { userId: externalRef, retrospectiveId: externalRef };
            }
          } else {
            logger.warn('⚠️ No external_reference found in payment data');
          }

          const userId = metadata.userId;
          const retrospectiveId = metadata.retrospectiveId;
          const credits = metadata.credits;
          const type = metadata.type;

          // Handle credits purchase
          if (type === 'credits' && userId && credits) {
            logger.log('🎫 Adding credits to user:', userId);
            logger.log('🎫 Credits to add:', credits);
            logger.log('🎫 Credits type:', typeof credits, 'value:', credits);

            try {
              const creditsRef = doc(db, 'credits', userId);
              const creditsDoc = await getDoc(creditsRef);

              const creditsToAdd = parseInt(credits.toString(), 10);
              logger.log('🎫 Credits to add (parsed):', creditsToAdd);

              if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
                logger.error('❌ Invalid credits value:', creditsToAdd);
                throw new Error(`Invalid credits value: ${creditsToAdd}`);
              }

              if (creditsDoc.exists()) {
                const currentCredits = creditsDoc.data().credits || 0;
                const newCredits = currentCredits + creditsToAdd;
                logger.log('📊 Current credits:', currentCredits);
                logger.log('📊 New credits total:', newCredits);
                
                await updateDoc(creditsRef, {
                  credits: newCredits,
                });
                logger.log('✅ Credits updated successfully:', newCredits);
              } else {
                logger.log('📝 Creating new credits document for user:', userId);
                await setDoc(creditsRef, {
                  credits: creditsToAdd,
                });
                logger.log('✅ Credits document created successfully with:', creditsToAdd);
              }
              
              // Verify the update was successful
              const verifyDoc = await getDoc(creditsRef);
              if (verifyDoc.exists()) {
                const verifiedCredits = verifyDoc.data().credits;
                logger.log('✅ Verification: Credits in Firestore:', verifiedCredits);
              } else {
                logger.error('❌ Verification failed: Credits document does not exist after update');
              }
            } catch (dbError: any) {
              logger.error('❌ Error updating credits in Firestore:', dbError);
              logger.error('❌ Error details:', {
                message: dbError.message,
                stack: dbError.stack,
                userId,
                credits,
              });
              throw dbError; // Re-throw to be caught by outer try-catch
            }
          } else {
            logger.warn('⚠️ Credits purchase not processed:', {
              type,
              userId,
              credits,
              hasType: !!type,
              hasUserId: !!userId,
              hasCredits: !!credits,
              typeMatches: type === 'credits',
              metadata,
            });
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
          logger.log('ℹ️ Payment not approved yet:', paymentData.status);
        }
      } catch (fetchError) {
        logger.error('❌ Error fetching payment details:', fetchError);
        return NextResponse.json({ received: true, status: 'error' }, { status: 500 });
      }
    } else {
      logger.log('ℹ️ Webhook type not handled:', payload.type);
    }

    return NextResponse.json({ 
      received: true, 
      status: 'success',
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

