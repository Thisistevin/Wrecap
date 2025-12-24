import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, preferenceId, userId, credits } = body;

    logger.log('💰 Processing payment success:', { paymentId, preferenceId, userId, credits });

    // If we have preferenceId but no paymentId, try to find payment by preference
    if (!paymentId && preferenceId) {
      logger.log('🔍 No paymentId provided, searching by preference_id:', preferenceId);
      
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        logger.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      try {
        // Search for payments with this preference_id
        const searchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?preference_id=${preferenceId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          logger.log('🔍 Search results:', searchData);
          
          if (searchData.results && searchData.results.length > 0) {
            // Get the most recent approved payment
            const approvedPayment = searchData.results.find((p: any) => p.status === 'approved' || p.status === 'authorized');
            if (approvedPayment) {
              logger.log('✅ Found approved payment:', approvedPayment.id);
              // Process with the found payment
              return await processPayment(approvedPayment.id, accessToken);
            }
          }
        }
      } catch (searchError) {
        logger.error('❌ Error searching for payment:', searchError);
      }
    }

    // If we have userId and credits, we can process directly (useful for pending Pix payments)
    if (userId && credits) {
      logger.log('💳 Processing payment with userId and credits (may be pending)');
      
      // If we have paymentId, check status first
      if (paymentId) {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (accessToken) {
          try {
            const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              logger.log('💰 Payment status:', paymentData.status);
              
              // If approved, process normally
              if (paymentData.status === 'approved' || paymentData.status === 'authorized') {
                return await processPayment(paymentId, accessToken);
              }
              // If pending, process credits directly (webhook will confirm later)
              else if (paymentData.status === 'pending') {
                logger.log('⏳ Payment is pending (Pix), processing credits directly');
                return await processCreditsDirectly(userId, parseInt(credits.toString(), 10));
              }
              // Other statuses
              else {
                logger.warn('⚠️ Payment not approved or pending:', paymentData.status);
                return NextResponse.json(
                  { error: `Payment status: ${paymentData.status}` },
                  { status: 400 }
                );
              }
            }
          } catch (fetchError) {
            logger.error('❌ Error fetching payment status, processing directly:', fetchError);
            // Fallback: process directly if we can't fetch status
            return await processCreditsDirectly(userId, parseInt(credits.toString(), 10));
          }
        }
      }
      
      // Process directly with userId/credits
      return await processCreditsDirectly(userId, parseInt(credits.toString(), 10));
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId, preferenceId, or userId/credits' },
        { status: 400 }
      );
    }

    // Process with paymentId
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      logger.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    return await processPayment(paymentId, accessToken);
  } catch (error: any) {
    logger.error('❌ Error processing payment success:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processPayment(paymentId: string, accessToken: string) {
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
        error: errorText.substring(0, 200),
      });
      return NextResponse.json(
        { error: 'Failed to fetch payment details' },
        { status: paymentResponse.status }
      );
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
    
    if (!isApproved) {
      logger.log('ℹ️ Payment not approved:', paymentData.status);
      return NextResponse.json(
        { error: `Payment status: ${paymentData.status}` },
        { status: 400 }
      );
    }

    // Extract metadata from external_reference
    let metadata: any = {};
    const externalRef = paymentData.external_reference;
    
    if (externalRef) {
      try {
        metadata = JSON.parse(externalRef);
        logger.log('✅ Parsed metadata:', metadata);
      } catch {
        logger.warn('⚠️ Could not parse external_reference as JSON:', externalRef);
        return NextResponse.json(
          { error: 'Invalid payment metadata' },
          { status: 400 }
        );
      }
    } else {
      logger.warn('⚠️ No external_reference in payment data');
      return NextResponse.json(
        { error: 'No metadata in payment' },
        { status: 400 }
      );
    }

    const userId = metadata.userId;
    const credits = metadata.credits;
    const type = metadata.type;

    // Handle credits purchase
    if (type === 'credits' && userId && credits) {
      return await processCreditsDirectly(userId, parseInt(credits.toString(), 10));
    } else {
      logger.warn('⚠️ Payment metadata missing required fields:', { userId, credits, type });
      return NextResponse.json(
        { error: 'Invalid payment metadata' },
        { status: 400 }
      );
    }
  } catch (fetchError: any) {
    logger.error('❌ Error fetching payment details:', fetchError);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

async function processCreditsDirectly(userId: string, creditsToAdd: number) {
  logger.log('🎫 Adding credits to user:', userId);
  logger.log('🎫 Credits to add:', creditsToAdd);

  const creditsRef = doc(db, 'credits', userId);
  const creditsDoc = await getDoc(creditsRef);

  let newCreditsTotal = creditsToAdd;

  if (creditsDoc.exists()) {
    const currentCredits = creditsDoc.data().credits || 0;
    newCreditsTotal = currentCredits + creditsToAdd;
    await updateDoc(creditsRef, {
      credits: newCreditsTotal,
    });
    logger.log('✅ Credits updated:', newCreditsTotal);
  } else {
    await setDoc(creditsRef, {
      credits: creditsToAdd,
    });
    logger.log('✅ Credits document created with:', creditsToAdd);
  }

  return NextResponse.json({ 
    success: true,
    credits: newCreditsTotal,
  });
}

