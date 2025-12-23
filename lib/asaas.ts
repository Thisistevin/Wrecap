import { logger } from './logger';

export interface AsaasCheckout {
  amount: number;
  description: string;
  customer?: string; // CPF/CNPJ ou email do cliente
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD';
  dueDate: string; // Formato: YYYY-MM-DD
  successUrl?: string;
  callbackUrl?: string; // Webhook URL
  metadata?: Record<string, any>;
}

export interface AsaasPaymentResponse {
  id?: string;
  customer?: string;
  billingType?: string;
  value?: number;
  netValue?: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  status?: string;
  dueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted?: boolean;
  anticipated?: boolean;
  anticipable?: boolean;
  refunds?: any;
  pixTransaction?: any;
  creditCard?: any;
  discount?: any;
  fine?: any;
  interest?: any;
  split?: any;
  chargeback?: any;
  postalService?: boolean;
  errors?: Array<{ code: string; description: string }>;
}

/**
 * Creates a payment/cobrança with Asaas
 * @param checkout - Checkout configuration
 * @returns Payment object with invoice URL or checkout URL
 */
export async function createAsaasPayment(checkout: AsaasCheckout): Promise<string> {
  const apiKey = process.env.ASAAS_API_KEY;
  const isSandbox = process.env.ASAAS_SANDBOX === 'true';
  const apiBaseUrl = isSandbox 
    ? 'https://api-sandbox.asaas.com/v3'
    : 'https://api.asaas.com/v3';

  // Validate checkout data
  if (!checkout.amount || checkout.amount <= 0) {
    throw new Error('Invalid checkout amount');
  }

  if (!apiKey) {
    throw new Error('ASAAS_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    logger.log('🔄 Creating Asaas payment...');
    logger.log('💰 Amount:', checkout.amount);
    logger.log('📝 Description:', checkout.description);
    logger.log('💳 Billing Type:', checkout.billingType);
    
    // Calculate due date (default: 3 days from now)
    const dueDate = checkout.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Prepare external reference (Asaas expects a string, we'll use JSON stringified metadata)
    const externalRef = checkout.metadata ? JSON.stringify(checkout.metadata) : undefined;

    const requestBody: any = {
      customer: checkout.customer || '',
      billingType: checkout.billingType,
      value: checkout.amount,
      dueDate: dueDate,
      description: checkout.description,
    };

    // Add external reference if provided
    if (externalRef) {
      requestBody.externalReference = externalRef;
    }

    // Add callback URL for webhook if provided
    if (checkout.callbackUrl) {
      requestBody.callback = checkout.callbackUrl;
    }

    const response = await fetch(`${apiBaseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data: AsaasPaymentResponse;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('❌ Failed to parse Asaas response:', responseText);
      throw new Error(`Invalid response from Asaas API: ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.description || responseText || response.statusText;
      logger.error('❌ Asaas API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        errors: data.errors,
      });
      throw new Error(`Asaas API error: ${errorMessage}`);
    }

    // Extract payment URL from response
    // Asaas returns invoiceUrl for most payment types
    let paymentUrl: string | undefined;
    
    // Priority order for payment URL
    if (data.invoiceUrl) {
      paymentUrl = data.invoiceUrl;
    } else if (checkout.billingType === 'BOLETO' && data.bankSlipUrl) {
      paymentUrl = data.bankSlipUrl;
    } else if (data.pixTransaction?.qrCodeBase64) {
      // For PIX, use invoice URL if available, otherwise we'll need to show QR code
      paymentUrl = data.invoiceUrl;
    }

    // Fallback: construct checkout URL from payment ID
    if (!paymentUrl && data.id) {
      const baseUrl = isSandbox ? 'https://sandbox.asaas.com' : 'https://www.asaas.com';
      paymentUrl = `${baseUrl}/c/${data.id}`;
    }
    
    if (!paymentUrl) {
      logger.error('❌ No payment URL in response:', data);
      throw new Error('Asaas did not return a payment URL');
    }

    logger.log('✅ Asaas payment created successfully');
    logger.log('🔗 Payment URL:', paymentUrl);
    logger.log('📄 Payment ID:', data.id);
    
    return paymentUrl;
  } catch (error: any) {
    logger.error('❌ Error creating Asaas payment:', error);
    
    // If it's a known error, throw it
    if (error.message && error.message.includes('Asaas')) {
      throw error;
    }
    
    throw new Error(`Failed to create Asaas payment: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Verifies webhook signature from Asaas
 * @param payload - Webhook payload
 * @param signature - Webhook signature from header
 * @returns boolean indicating if signature is valid
 */
export function verifyAsaasWebhookSignature(payload: string, signature: string): boolean {
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN || '';
  
  if (!webhookToken || !signature) {
    return false;
  }

  // Asaas typically sends the token in the signature header
  // You may need to adjust this based on Asaas documentation
  return signature === webhookToken;
}

