'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const retrospectiveId = searchParams.get('retrospectiveId');
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!retrospectiveId) {
      setError('ID da retrospectiva não encontrado');
      return;
    }

    // Listen to retrospective updates
    const retrospectiveRef = doc(db, 'retrospectives', retrospectiveId);
    const unsubscribe = onSnapshot(retrospectiveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentStatus = data.status || 'processing';
        setStatus(currentStatus);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Retrospective status updated:', currentStatus);
        }
        
        if (currentStatus === 'completed') {
          setTimeout(() => {
            router.push(`/retrospective/${retrospectiveId}`);
          }, 2000);
        } else if (currentStatus === 'failed') {
          setError('Erro ao processar retrospectiva. Verifique os logs do servidor.');
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Retrospective document not found:', retrospectiveId);
        }
        setError('Retrospectiva não encontrada');
      }
    }, (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error listening to retrospective:', error);
      }
      setError('Erro ao verificar status da retrospectiva');
    });

    // Check if processing hasn't started after 10 seconds
    const timeoutId = setTimeout(async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ Processing taking too long, checking status...');
      }
      
      const currentRetrospective = await getDoc(doc(db, 'retrospectives', retrospectiveId));
      if (currentRetrospective.exists()) {
        const currentStatus = currentRetrospective.data().status;
        
        if (currentStatus === 'processing') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Status is still processing, triggering manually...');
          }
          try {
            const response = await fetch(`/api/process-retrospective`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                retrospectiveId,
                zipFileUrl: null,
              }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              if (process.env.NODE_ENV === 'development') {
                console.error('❌ Failed to trigger processing:', errorText);
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.log('✅ Processing triggered successfully');
            }
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Error triggering processing:', err);
            }
          }
        }
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [retrospectiveId, router]);

  const handleRetry = async () => {
    if (!retrospectiveId) return;
    try {
      const response = await fetch('/api/process-retrospective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retrospectiveId }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Processing error:', data);
        }
        setError(data.error || 'Erro desconhecido');
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Processing started:', data);
        }
        setError(null);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error triggering processing:', err);
      }
      setError('Erro ao acionar processamento. Verifique o console.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12 bg-background">
      {/* Logo no topo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <Image
          src="/assets/wrecap-logo.png"
          alt="WRecap Logo"
          width={120}
          height={60}
          className="h-12 w-auto sm:h-16 sm:w-auto"
          priority
        />
      </div>

      {/* Background decorations - hidden on mobile */}
      <div className="hidden sm:block absolute top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="hidden sm:block absolute top-32 right-4 w-24 h-24 bg-lime/30 rounded-full blur-2xl opacity-60" />
      <div className="hidden sm:block absolute bottom-40 -left-4 w-16 h-16 bg-yellow/30 rounded-full blur-xl opacity-50" />
      <div className="hidden sm:block absolute bottom-20 right-8 w-24 h-24 bg-green/20 rounded-full blur-2xl opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
            {status === 'processing' && (
              <>
                <div className="flex justify-center">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-display text-foreground mb-2">
                    Processando sua retrospectiva...
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base font-body">
                    Isso pode levar alguns minutos. Por favor, aguarde.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="gap-2 font-body"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar processar novamente
                </Button>
              </>
            )}

            {status === 'completed' && (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green rounded-full flex items-center justify-center shadow-lg shadow-green/30">
                    <CheckCircle2 className="h-10 w-10 text-foreground" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-display text-foreground mb-2">
                    Retrospectiva concluída!
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base font-body">
                    Redirecionando para sua retrospectiva...
                  </CardDescription>
                </div>
              </>
            )}

            {status === 'failed' && (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-destructive rounded-full flex items-center justify-center shadow-lg shadow-destructive/30">
                    <XCircle className="h-10 w-10 text-destructive-foreground" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-display text-foreground mb-2">
                    Erro ao processar
                  </CardTitle>
                  {error && (
                    <Alert variant="destructive" className="mt-4 border-destructive/50">
                      <AlertDescription className="font-body">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button
                  onClick={() => router.push('/')}
                  className="gap-2 font-display bg-gradient-hero hover:opacity-90 text-foreground"
                >
                  Voltar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
