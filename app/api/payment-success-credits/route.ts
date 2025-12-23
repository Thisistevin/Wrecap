import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const credits = searchParams.get('credits');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  logger.log('📥 Payment success callback received:', {
    userId,
    credits,
    paymentId,
    status,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  if (!userId || !credits) {
    logger.error('❌ Missing userId or credits in callback');
    // Redirect to home with error message
    return NextResponse.redirect(
      new URL(`/?creditsError=true`, request.url)
    );
  }

  try {
    logger.log('💰 Processing credits addition for user:', userId);
    logger.log('🎫 Credits to add:', credits);

    const creditsRef = doc(db, 'credits', userId);
    const creditsDoc = await getDoc(creditsRef);

    const creditsToAdd = parseInt(credits, 10);

    if (creditsDoc.exists()) {
      // Update existing credits
      const currentCredits = creditsDoc.data().credits || 0;
      await updateDoc(creditsRef, {
        credits: currentCredits + creditsToAdd,
      });
      logger.log('✅ Credits updated:', currentCredits + creditsToAdd);
    } else {
      // Create new credits document
      await setDoc(creditsRef, {
        credits: creditsToAdd,
      });
      logger.log('✅ Credits document created with:', creditsToAdd);
    }

    // Redirect to home page with success message
    const redirectUrl = new URL(`/?creditsSuccess=true&credits=${credits}`, request.url);
    logger.log('🔄 Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    logger.error('❌ Error adding credits:', error);
    logger.error('❌ Error stack:', error.stack);
    // Redirect to home with error message
    return NextResponse.redirect(
      new URL(`/?creditsError=true`, request.url)
    );
  }
}

