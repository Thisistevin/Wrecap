'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/Logo';
import { Chrome, Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
      setLoading(false);
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
      <div className="hidden sm:block absolute top-1/2 right-2 w-16 h-16 bg-blue/20 rounded-full blur-xl opacity-40" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 sm:space-y-6 text-center pb-6 sm:pb-8 px-4 sm:px-6">
            <div className="flex justify-center">
              <Logo className="w-24 h-12 sm:w-32 sm:h-16" />
            </div>
            <div>
              <CardTitle className="text-3xl sm:text-4xl font-display text-gradient-hero mb-2">
                WRecap
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-body text-muted-foreground">
                Transforme suas conversas do WhatsApp em memórias incríveis
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 sm:pb-8 px-4 sm:px-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription className="font-body">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 sm:h-14 text-sm sm:text-base font-display bg-gradient-hero hover:opacity-90 text-foreground shadow-lg shadow-primary/20 transition-all"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Entrar com Google
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground font-body">
                Ao continuar, você concorda com nossos termos de uso
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Powered by */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground font-body">
            powered by <span className="font-display text-primary">WRecap</span>
          </p>
        </div>
      </div>
    </div>
  );
}
