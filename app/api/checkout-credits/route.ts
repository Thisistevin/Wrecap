import { NextRequest, NextResponse } from 'next/server';
import { createMercadoPagoCheckout } from '@/lib/mercadopago';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, credits, userId, userEmail } = body;

    if (!amount || !credits || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, credits, userId' },
        { status: 400 }
      );
    }

    logger.log('🔄 Creating credits checkout with Mercado Pago...');
    logger.log('💰 Amount:', amount);
    logger.log('🎫 Credits:', credits);
    logger.log('👤 User ID:', userId);
    
    const origin = request.nextUrl.origin;
    logger.log('🌐 Origin:', origin);
    
    // Ensure origin is valid
    if (!origin || origin === 'null' || origin === 'undefined') {
      throw new Error('Invalid origin URL. Make sure the request has a valid origin.');
    }

    // Use a dedicated success page that will process the payment
    const successUrl = `${origin}/payment-success?userId=${userId}&credits=${credits}`;
    const failureUrl = `${origin}?canceled=true`;
    const pendingUrl = `${origin}/payment-success?userId=${userId}&credits=${credits}&status=pending`;
    const webhookUrl = `${origin}/api/mercadopago-webhook`;
    
    logger.log('✅ Success URL:', successUrl);
    logger.log('❌ Failure URL:', failureUrl);
    logger.log('⏳ Pending URL:', pendingUrl);
    logger.log('🔔 Webhook URL:', webhookUrl);

    const checkoutUrl = await createMercadoPagoCheckout({
      amount,
      description: `Créditos WRecap (${credits} retrospectivas)`,
      successUrl,
      failureUrl,
      pendingUrl,
      metadata: {
        userId,
        credits,
        amount,
        type: 'credits',
        webhookUrl,
      },
      payer: userEmail ? { email: userEmail } : undefined,
    });

    logger.log('✅ Checkout URL created:', checkoutUrl);

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    logger.error('❌ Error creating credits checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

