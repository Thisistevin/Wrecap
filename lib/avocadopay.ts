import { logger } from './logger';

export interface AvocadoPayCheckout {
  amount: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface AvocadoPayCheckoutResponse {
  checkout_url?: string;
  url?: string;
  id?: string;
  status?: string;
  error?: string;
}

/**
 * Creates a checkout session with AvocadoPay
 * @param checkout - Checkout configuration
 * @returns Checkout URL to redirect the user
 */
export async function createAvocadoPayCheckout(checkout: AvocadoPayCheckout): Promise<string> {
  const apiKey = process.env.AVOCADOPAY_API_KEY;

  // Validate checkout data
  if (!checkout.amount || checkout.amount <= 0) {
    throw new Error('Invalid checkout amount');
  }
  if (!checkout.successUrl || !checkout.cancelUrl) {
    throw new Error('Missing success or cancel URL');
  }

  if (!apiKey) {
    throw new Error('AVOCADOPAY_API_KEY is not configured. Please set it in your environment variables.');
  }

  // Production: Use AvocadoPay API
  const apiUrl = process.env.NEXT_PUBLIC_AVOCADOPAY_API_URL || 'https://api.abacatepay.com/v1/checkouts';
  const checkoutBaseUrl = process.env.NEXT_PUBLIC_AVOCADOPAY_CHECKOUT_URL || 'https://checkout.abacatepay.com';
  
  try {
    logger.log('🔄 Creating AvocadoPay checkout...');
    logger.log('💰 Amount:', checkout.amount, checkout.currency);
    logger.log('📝 Description:', checkout.description);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'WRecap/1.0',
      },
      body: JSON.stringify({
        amount: checkout.amount,
        currency: checkout.currency,
        description: checkout.description,
        success_url: checkout.successUrl,
        cancel_url: checkout.cancelUrl,
        metadata: checkout.metadata || {},
      }),
    });

    const responseText = await response.text();
    let data: AvocadoPayCheckoutResponse;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('❌ Failed to parse AvocadoPay response:', responseText);
      throw new Error(`Invalid response from AvocadoPay API: ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || responseText || response.statusText;
      logger.error('❌ AvocadoPay API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });
      throw new Error(`AvocadoPay API error: ${errorMessage}`);
    }

    // Extract checkout URL from response
    const checkoutUrl = data.checkout_url || data.url;
    
    if (!checkoutUrl) {
      logger.error('❌ No checkout URL in response:', data);
      throw new Error('AvocadoPay did not return a checkout URL');
    }

    logger.log('✅ AvocadoPay checkout created successfully');
    logger.log('🔗 Checkout URL:', checkoutUrl);
    
    return checkoutUrl;
  } catch (error: any) {
    logger.error('❌ Error creating AvocadoPay checkout:', error);
    
    // If it's a known error, throw it
    if (error.message && error.message.includes('AvocadoPay')) {
      throw error;
    }
    
    // Fallback: use URL direta com parâmetros (se suportado)
    logger.warn('⚠️ Using fallback checkout URL method');
    const params = new URLSearchParams({
      amount: checkout.amount.toString(),
      currency: checkout.currency,
      description: checkout.description,
      success_url: checkout.successUrl,
      cancel_url: checkout.cancelUrl,
      ...(checkout.metadata && { metadata: JSON.stringify(checkout.metadata) }),
    });
    
    const fallbackUrl = `${checkoutBaseUrl}?${params.toString()}`;
    logger.log('🔗 Fallback checkout URL:', fallbackUrl);
    
    return fallbackUrl;
  }
}

