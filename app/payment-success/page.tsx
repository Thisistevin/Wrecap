'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando pagamento...');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const statusParam = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');

    logger.log('📥 Payment success page loaded:', {
      paymentId,
      status: statusParam,
      preferenceId,
    });

    // Check if we have payment_id or if we need to extract from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIdFromUrl = urlParams.get('payment_id') || paymentId;
    const statusFromUrl = urlParams.get('status') || statusParam;

    logger.log('📥 Payment success page - All params:', {
      paymentId: paymentIdFromUrl,
      status: statusFromUrl,
      preferenceId,
      allParams: Object.fromEntries(urlParams.entries()),
    });

    // Get userId and credits from URL params (they're in the success URL)
    const userId = searchParams.get('userId');
    const credits = searchParams.get('credits');

    // If payment_id is present, try to process (even if pending - Pix can take time)
    if (paymentIdFromUrl) {
      // For pending payments (Pix), we can still process if we have userId/credits
      if (statusFromUrl === 'pending' && userId && credits) {
        logger.log('⏳ Payment is pending (Pix), processing with userId/credits');
        setMessage('Pagamento pendente. Processando créditos...');
        
        // Process directly with userId/credits (Pix will be confirmed later via webhook)
        fetch('/api/process-payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentIdFromUrl,
            preferenceId,
            userId,
            credits,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
              setStatus('success');
              setMessage(`Créditos adicionados! ${data.credits ? `Você agora tem ${data.credits} créditos.` : ''} O pagamento será confirmado em breve. Redirecionando...`);
              setTimeout(() => {
                router.push('/?creditsSuccess=true');
              }, 3000);
            } else {
              // If processing fails, show pending message and redirect
              setMessage('Pagamento pendente. Os créditos serão adicionados automaticamente quando o pagamento for confirmado.');
              setTimeout(() => {
                router.push('/?creditsPending=true');
              }, 3000);
            }
          })
          .catch((error) => {
            logger.error('❌ Error processing pending payment:', error);
            setMessage('Pagamento pendente. Os créditos serão adicionados automaticamente quando o pagamento for confirmado.');
            setTimeout(() => {
              router.push('/?creditsPending=true');
            }, 3000);
          });
      } else if (statusFromUrl === 'approved' || statusFromUrl === null) {
        // Approved payment - process normally
        setMessage('Processando pagamento...');
        
        // Process payment via API
        fetch('/api/process-payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentIdFromUrl,
            preferenceId,
            userId,
            credits,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
              setStatus('success');
              setMessage(`Pagamento processado com sucesso! ${data.credits ? `Você agora tem ${data.credits} créditos.` : ''} Redirecionando...`);
              setTimeout(() => {
                router.push('/?creditsSuccess=true');
              }, 3000);
            } else {
              setStatus('error');
              setMessage(data.error || 'Erro ao processar pagamento. Verifique os logs do servidor.');
              logger.error('❌ Payment processing error:', data);
            }
          })
          .catch((error) => {
            logger.error('❌ Error processing payment:', error);
            setStatus('error');
            setMessage('Erro ao processar pagamento. Tente novamente ou verifique os logs.');
          });
      } else {
        // Other status (rejected, cancelled, etc.)
        setStatus('error');
        setMessage(`Status do pagamento: ${statusFromUrl || 'desconhecido'}`);
      }
    } else if (!paymentIdFromUrl) {
      // No payment_id in URL, but user might have come from Mercado Pago
      // Try to process using preference_id or userId/credits
      if (userId && credits) {
        setMessage('Processando pagamento...');
        
        // Try to process with preference_id or userId/credits
        fetch('/api/process-payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferenceId,
            userId,
            credits,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
              setStatus('success');
              setMessage(`Pagamento processado com sucesso! ${data.credits ? `Você agora tem ${data.credits} créditos.` : ''} Redirecionando...`);
              setTimeout(() => {
                router.push('/?creditsSuccess=true&credits=' + credits);
              }, 3000);
            } else {
              // If processing fails, assume webhook will handle it
              setMessage('Aguardando confirmação do pagamento...');
              setTimeout(() => {
                router.push('/?creditsSuccess=true&credits=' + credits);
              }, 3000);
            }
          })
          .catch((error) => {
            logger.error('❌ Error processing payment:', error);
            // Even if fails, redirect - webhook should handle it
            setMessage('Redirecionando...');
            setTimeout(() => {
              router.push('/?creditsSuccess=true&credits=' + credits);
            }, 2000);
          });
      } else {
        logger.warn('⚠️ No payment_id or user data found, redirecting to home');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground font-body">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-foreground font-body">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-destructive font-body">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-display"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-foreground font-body">Carregando...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

