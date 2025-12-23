import { logger } from './logger';

export interface MercadoPagoCheckout {
  amount: number;
  description: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl?: string;
  metadata?: Record<string, any>;
  payer?: {
    email?: string;
    name?: string;
  };
}

export interface MercadoPagoPreferenceResponse {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  status?: string;
  error?: string;
  message?: string;
  cause?: Array<{ code: string; description: string }>;
}

/**
 * Creates a payment preference with Mercado Pago
 * @param checkout - Checkout configuration
 * @returns Checkout URL to redirect the user
 */
export async function createMercadoPagoCheckout(checkout: MercadoPagoCheckout, retryWithoutAutoReturn: boolean = false): Promise<string> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const isSandbox = process.env.MERCADOPAGO_SANDBOX === 'true';

  // Validate checkout data
  if (!checkout.amount || checkout.amount <= 0) {
    throw new Error('Invalid checkout amount');
  }

  // Mercado Pago expects unit_price in reais (decimal format)
  // e.g., 7.00 for R$ 7,00, not 700 cents
  // Ensure amount is a valid number
  const amountValue = Number(checkout.amount);
  
  if (isNaN(amountValue) || amountValue <= 0) {
    throw new Error(`Invalid amount: ${checkout.amount}`);
  }

  // Ensure amount is at least R$ 0.01
  if (amountValue < 0.01) {
    throw new Error('Amount must be at least R$ 0.01');
  }

  if (!checkout.successUrl || !checkout.failureUrl) {
    throw new Error('Missing success or failure URL');
  }

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured. Please set it in your environment variables.');
  }

  // Warn if using production token in sandbox mode or vice versa
  if (isSandbox && accessToken.startsWith('APP_USR-')) {
    logger.warn('⚠️ Using production token format in sandbox mode. Make sure you are using TEST credentials.');
  } else if (!isSandbox && accessToken.startsWith('TEST-')) {
    logger.warn('⚠️ Using test token format in production mode. Make sure you are using PRODUCTION credentials.');
  }

  try {
    logger.log('🔄 Creating Mercado Pago preference...');
    logger.log('💰 Amount:', checkout.amount);
    logger.log('📝 Description:', checkout.description);
    logger.log('✅ Success URL:', checkout.successUrl);
    logger.log('❌ Failure URL:', checkout.failureUrl);
    
    const apiUrl = 'https://api.mercadopago.com/checkout/preferences';
    
    // Ensure all URLs are valid strings
    if (!checkout.successUrl || typeof checkout.successUrl !== 'string' || checkout.successUrl.trim() === '') {
      throw new Error('successUrl must be a valid non-empty string');
    }
    if (!checkout.failureUrl || typeof checkout.failureUrl !== 'string' || checkout.failureUrl.trim() === '') {
      throw new Error('failureUrl must be a valid non-empty string');
    }

    const backUrls = {
      success: checkout.successUrl.trim(),
      failure: checkout.failureUrl.trim(),
      pending: (checkout.pendingUrl || checkout.successUrl).trim(),
    };

    logger.log('📋 Back URLs:', backUrls);

    // Build request body with proper structure
    // Mercado Pago expects unit_price in reais (decimal format)
    // e.g., 7.00 for R$ 7,00 (not 700 cents)
    const unitPrice = amountValue;
    
    logger.log('💰 Unit price (reais):', unitPrice);

    // Ensure back_urls.success is valid before creating request body
    if (!backUrls.success || backUrls.success.trim().length === 0 || !backUrls.success.startsWith('http')) {
      throw new Error(`Invalid success URL: ${backUrls.success}. Must be a valid HTTP/HTTPS URL.`);
    }

    // Validate all back URLs
    if (!backUrls.failure || !backUrls.failure.startsWith('http')) {
      throw new Error(`Invalid failure URL: ${backUrls.failure}. Must be a valid HTTP/HTTPS URL.`);
    }
    if (!backUrls.pending || !backUrls.pending.startsWith('http')) {
      throw new Error(`Invalid pending URL: ${backUrls.pending}. Must be a valid HTTP/HTTPS URL.`);
    }

    // Build request body - IMPORTANT: back_urls must be defined BEFORE auto_return
    const requestBody: any = {
      items: [
        {
          title: checkout.description || 'Pagamento WRecap',
          quantity: 1,
          unit_price: unitPrice, // In reais (decimal format)
          currency_id: 'BRL',
        },
      ],
    };

    // Add back_urls first (required before auto_return)
    requestBody.back_urls = {
      success: backUrls.success,
      failure: backUrls.failure,
      pending: backUrls.pending,
    };

    // Only add auto_return after back_urls is set
    // Note: Some Mercado Pago accounts may not support auto_return in sandbox mode
    // If this fails, retry without auto_return and rely on webhook + manual redirect
    if (!retryWithoutAutoReturn) {
      requestBody.auto_return = 'approved';
      logger.log('✅ auto_return enabled - user will be automatically redirected after payment approval');
    } else {
      logger.log('ℹ️ auto_return disabled - will rely on webhook and manual redirect');
    }

    logger.log('✅ Request body structure:', {
      hasItems: !!requestBody.items,
      hasBackUrls: !!requestBody.back_urls,
      backUrlsSuccess: requestBody.back_urls?.success,
      backUrlsFailure: requestBody.back_urls?.failure,
      backUrlsPending: requestBody.back_urls?.pending,
    });

    // Add optional fields only if they have values
    if (checkout.metadata?.webhookUrl) {
      requestBody.notification_url = checkout.metadata.webhookUrl;
    }

    if (checkout.metadata) {
      requestBody.external_reference = JSON.stringify(checkout.metadata);
    }

    requestBody.statement_descriptor = 'WRECAP';

    // Add payer information if provided
    if (checkout.payer && checkout.payer.email) {
      requestBody.payer = checkout.payer;
    }

    // Final validation before sending
    if (!requestBody.back_urls || !requestBody.back_urls.success) {
      throw new Error('back_urls.success is required but was not set in request body');
    }

    logger.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    logger.log('🔍 Validating back_urls:', {
      hasBackUrls: !!requestBody.back_urls,
      success: requestBody.back_urls?.success,
      failure: requestBody.back_urls?.failure,
      pending: requestBody.back_urls?.pending,
      autoReturn: requestBody.auto_return,
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data: MercadoPagoPreferenceResponse;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('❌ Failed to parse Mercado Pago response:', responseText);
      throw new Error(`Invalid response from Mercado Pago API: ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          data.cause?.[0]?.description || 
                          responseText || 
                          response.statusText;
      
      logger.error('❌ Mercado Pago API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        cause: data.cause,
        fullResponse: responseText,
      });
      
      // If error is about auto_return and we haven't retried yet, retry without auto_return
      if (response.status === 400 && 
          errorMessage.includes('auto_return') && 
          !retryWithoutAutoReturn) {
        logger.log('🔄 Retrying without auto_return...');
        return createMercadoPagoCheckout(checkout, true);
      }
      
      // Provide more helpful error messages
      if (response.status === 401) {
        throw new Error(`Mercado Pago API error: Invalid Access Token. Please check your MERCADOPAGO_ACCESS_TOKEN. ${errorMessage}`);
      } else if (response.status === 400) {
        throw new Error(`Mercado Pago API error: Invalid request data. ${errorMessage}`);
      } else {
        throw new Error(`Mercado Pago API error: ${errorMessage}`);
      }
    }

    // Extract checkout URL from response
    // Use sandbox_init_point if in sandbox mode, otherwise init_point
    const checkoutUrl = isSandbox ? data.sandbox_init_point : data.init_point;
    
    if (!checkoutUrl) {
      logger.error('❌ No checkout URL in response:', data);
      throw new Error('Mercado Pago did not return a checkout URL');
    }

    logger.log('✅ Mercado Pago preference created successfully');
    logger.log('🔗 Checkout URL:', checkoutUrl);
    logger.log('📄 Preference ID:', data.id);
    
    return checkoutUrl;
  } catch (error: any) {
    logger.error('❌ Error creating Mercado Pago checkout:', error);
    
    // If it's a known error, throw it
    if (error.message && error.message.includes('Mercado Pago')) {
      throw error;
    }
    
    throw new Error(`Failed to create Mercado Pago checkout: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Verifies webhook signature from Mercado Pago
 * @param xSignature - Signature header from Mercado Pago
 * @param xRequestId - Request ID header
 * @returns boolean indicating if signature is valid
 */
export function verifyMercadoPagoWebhook(
  xSignature: string | null,
  xRequestId: string | null
): boolean {
  // Mercado Pago webhook verification
  // In production, you should verify the signature properly
  // For now, we'll just check if the headers are present
  // The webhook will also fetch payment details from Mercado Pago API to verify
  if (!xSignature || !xRequestId) {
    return false;
  }

  // TODO: Implement proper signature verification if needed
  // Mercado Pago webhooks are typically verified by fetching payment details
  // For now, we'll accept if headers are present and verify via API call
  return true;
}

