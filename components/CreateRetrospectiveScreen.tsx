'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { useDropzone } from 'react-dropzone';
import { signOut } from '@/lib/auth';
import { uploadFile, scheduleFileDeletion } from '@/lib/storage';
import { createRetrospective, createPhoto, updateRetrospective } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Logo from '@/components/Logo';
import { Upload, Image as ImageIcon, LogOut, Sparkles, CheckCircle2, Menu, X, Youtube, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import Link from 'next/link';

interface CreateRetrospectiveScreenProps {
  user: User;
}

export default function CreateRetrospectiveScreen({ user }: CreateRetrospectiveScreenProps) {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [friendPhoto, setFriendPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [retrospectives, setRetrospectives] = useState<Array<{ id: string; createdAt?: any; title?: string; ephemeral?: boolean }>>([]);
  const [loadingRetros, setLoadingRetros] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number>(7); // recomendado
  const [info, setInfo] = useState<string | null>(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);

  const userAvatar = user.photoURL || `https://www.gravatar.com/avatar/${encodeURIComponent(user.email || '')}?d=identicon`;

  const retrosForPrice = useMemo(() => {
    if (selectedPrice < 7) {
      return selectedPrice - 3; // 5->2, 6->3
    }
    // bônus +1 a partir de 7: n+1
    return selectedPrice - 2; // 7->5, 8->6...
  }, [selectedPrice]);

  const loadRetrospectives = async () => {
    try {
      setLoadingRetros(true);
      const q = query(
        collection(db, 'retrospectives'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs
        .map(doc => ({
          id: doc.id,
          createdAt: doc.data().createdAt,
          title: doc.data().title,
          ephemeral: doc.data().ephemeral,
        }))
        .filter(item => item.ephemeral !== true);
      setRetrospectives(items);
    } catch (err) {
      logger.error('Erro ao carregar retrospectivas', err);
    } finally {
      setLoadingRetros(false);
    }
  };

  const loadCredits = async () => {
    try {
      setLoadingCredits(true);
      const ref = doc(db, 'credits', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as { credits?: number };
        setCredits(data.credits ?? 0);
      } else {
        setCredits(0);
      }
    } catch (err) {
      logger.error('Erro ao carregar créditos', err);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleBuyCredits = async () => {
    try {
      // Mercado Pago expects amount in reais (decimal), not cents
      // selectedPrice is already in reais (e.g., 7 for R$ 7,00)
      const amountInReais = selectedPrice;
      
      const response = await fetch('/api/checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInReais, // Send amount in reais (decimal)
          credits: retrosForPrice,
          userId: user.uid,
          userEmail: user.email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      logger.error('Erro ao abrir checkout de créditos', err);
      setError(err.message || 'Não foi possível iniciar o checkout de créditos. Tente novamente.');
    }
  };

  // Carrega retrospectivas quando o menu abre pela primeira vez
  const handleToggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next && retrospectives.length === 0) {
      void loadRetrospectives();
      void loadCredits();
    }
  };

  useEffect(() => {
    void loadCredits();
  }, []);

  const onDropZip = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB
      
      if (file.size > MAX_ZIP_SIZE) {
        setError(`Arquivo ZIP muito grande. Tamanho máximo: 50MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      setZipFile(file);
      setError(null);
    }
  };

  const onDropUserPhoto = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Foto muito grande. Tamanho máximo: 10MB. Sua foto: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      setUserPhoto(file);
      setError(null);
    }
  };

  const onDropFriendPhoto = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Foto muito grande. Tamanho máximo: 10MB. Sua foto: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      setFriendPhoto(file);
      setError(null);
    }
  };

  const { getRootProps: getZipRootProps, getInputProps: getZipInputProps, isDragActive: isZipDragActive } = useDropzone({
    onDrop: onDropZip,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    multiple: false,
  });

  const { getRootProps: getUserPhotoRootProps, getInputProps: getUserPhotoInputProps } = useDropzone({
    onDrop: onDropUserPhoto,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
  });

  const { getRootProps: getFriendPhotoRootProps, getInputProps: getFriendPhotoInputProps } = useDropzone({
    onDrop: onDropFriendPhoto,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
  });

  const processRetrospective = async (skipTrialCheck: boolean = false) => {
    if (!zipFile || !userPhoto || !friendPhoto) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const isFreeTrial = credits <= 0 && !skipTrialCheck;
    if (!skipTrialCheck && isFreeTrial) {
      setShowTrialDialog(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const userId = user.uid;

      const zipPath = `temp/${userId}/${timestamp}/chat.zip`;
      const userPhotoPath = `temp/${userId}/${timestamp}/user-photo.jpg`;
      const friendPhotoPath = `temp/${userId}/${timestamp}/friend-photo.jpg`;

      const [zipUrl, userPhotoUrl, friendPhotoUrl] = await Promise.all([
        uploadFile(zipFile, zipPath),
        uploadFile(userPhoto, userPhotoPath),
        uploadFile(friendPhoto, friendPhotoPath),
      ]);

      scheduleFileDeletion(zipPath, 3600000);

      const retrospectiveId = await createRetrospective({
        userId,
        userPic: userPhotoUrl,
        friendPic: friendPhotoUrl,
        textContentJson: '',
        status: 'processing',
        ephemeral: isFreeTrial,
        title: '',
      } as any);

      await updateRetrospective(retrospectiveId, {
        zipFileUrl: zipUrl,
      } as any);

      await Promise.all([
        createPhoto({
          retrospectiveId,
          userId,
          photoUrl: userPhotoUrl,
          type: 'user',
        }),
        createPhoto({
          retrospectiveId,
          userId,
          photoUrl: friendPhotoUrl,
          type: 'friend',
        }),
      ]);

      if (!isFreeTrial) {
        try {
          const ref = doc(db, 'credits', user.uid);
          await setDoc(ref, { credits: increment(-1) }, { merge: true });
          setCredits((c) => Math.max(0, c - 1));
        } catch (err) {
          logger.error('Erro ao debitar crédito', err);
        }
      }

      // Dispara processamento imediatamente
      try {
        const resp = await fetch('/api/process-retrospective', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            retrospectiveId,
            zipFileUrl: zipUrl,
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || 'Falha ao iniciar processamento');
        }
      } catch (err: any) {
        setError(err.message || 'Falha ao iniciar processamento');
        setLoading(false);
        return;
      }

      // Redireciona para tela de processamento
      window.location.href = `/processing?retrospectiveId=${retrospectiveId}`;
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivos');
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    processRetrospective(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Botão menu sanduíche */}
      <button
        onClick={handleToggleMenu}
        className="absolute top-4 left-4 z-30 rounded-full bg-card border border-border shadow-lg p-2 text-primary hover:bg-muted transition-colors"
        aria-label="Abrir menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Menu lateral */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-card/95 backdrop-blur-md border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4 gap-4 relative">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt="Foto do usuário"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <p className="text-base font-semibold text-foreground truncate">Menu</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Minhas retrospectivas</p>
              {loadingRetros ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : retrospectives.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma retrospectiva ainda.</p>
              ) : (
                <ul className="space-y-2">
                {retrospectives.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/retrospective/${r.id}`}
                        className="block w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                      <span className="font-medium">{r.title?.trim() || 'Retrospectiva'}</span>
                      <span className="block text-xs text-muted-foreground break-all">{r.id}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Créditos</p>
                <span className="text-sm text-primary font-semibold">
                  {loadingCredits ? '...' : `${credits} crédito${credits === 1 ? '' : 's'}`}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Selecione o valor (R$)</label>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">R$ {selectedPrice},00</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedPrice >= 7 ? '+1 bônus' : ' '}
                  </span>
                </div>
                <div className="rounded-md border border-border bg-card/80 px-3 py-2 text-sm">
                  <p className="text-foreground">
                    Você poderá fazer{' '}
                    <span className="font-semibold text-primary">{retrosForPrice}</span>{' '}
                    retrospectiva{retrosForPrice === 1 ? '' : 's'}.
                  </p>
                  {selectedPrice >= 7 && (
                    <p className="text-xs text-muted-foreground">
                      Bônus aplicado: +1 retrospectiva (recomendado)
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleBuyCredits}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loadingCredits}
                >
                  Adicionar créditos
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <img
              src={userAvatar}
              alt="Foto do usuário"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Conectado</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Logo no topo */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <Image
          src="/assets/wrecap-logo.png"
          alt="WRecap Logo"
          width={120}
          height={60}
          className="h-10 w-auto sm:h-14 sm:w-auto"
          priority
        />
      </div>

      {/* Background decorations - hidden on mobile */}
      <div className="hidden sm:block absolute top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="hidden sm:block absolute top-32 right-4 w-32 h-32 bg-lime/20 rounded-full blur-2xl opacity-60" />
      <div className="hidden sm:block absolute bottom-40 -left-4 w-24 h-24 bg-yellow/20 rounded-full blur-xl opacity-50" />
      <div className="hidden sm:block absolute bottom-20 right-8 w-32 h-32 bg-green/15 rounded-full blur-2xl opacity-50" />

      <div className="max-w-4xl mx-auto relative z-10 pt-16 sm:pt-20">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Logo className="w-20 h-10 sm:w-24 sm:h-12 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-display text-gradient-hero break-words">
                    Criar Retrospectiva 2025
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base font-body mt-1">
                    Transforme suas conversas em memórias
                  </CardDescription>
                </div>
              </div>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-body text-foreground hover:bg-muted transition-colors w-full sm:w-auto"
              >
                <Youtube className="h-4 w-4 text-red-500" />
                <span>Ver tutorial</span>
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription className="font-body">{error}</AlertDescription>
              </Alert>
            )}

            {/* ZIP File Upload */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-display text-foreground flex items-center gap-2">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                Arquivo ZIP das conversas do WhatsApp
              </label>
              <div
                {...getZipRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200",
                  isZipDragActive
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5",
                  zipFile && "border-green bg-green/10"
                )}
              >
                <input {...getZipInputProps()} />
                {zipFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green" />
                      <p className="text-sm font-display text-foreground">{zipFile.name}</p>
                    </div>
                    <p className="text-xs font-body text-muted-foreground">Arquivo selecionado ✓</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm font-body text-muted-foreground">
                      Arraste o arquivo ZIP aqui ou clique para selecionar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* User Photo */}
              <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-display text-foreground flex items-center gap-2">
                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    Minha foto
                  </label>
                <div
                  {...getUserPhotoRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200",
                    userPhoto 
                      ? "border-green bg-green/10" 
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <input {...getUserPhotoInputProps()} />
                  {userPhoto ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green" />
                        <p className="text-sm font-display text-foreground">{userPhoto.name}</p>
                      </div>
                      <img
                        src={URL.createObjectURL(userPhoto)}
                        alt="User photo preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg object-cover shadow-md"
                      />
                    </div>
                    ) : (
                      <div className="space-y-3">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm font-body text-muted-foreground">
                          Arraste sua foto aqui ou clique para selecionar
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Friend Photo */}
              <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-display text-foreground flex items-center gap-2">
                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                    Foto do meu amigo
                  </label>
                <div
                  {...getFriendPhotoRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200",
                    friendPhoto 
                      ? "border-green bg-green/10" 
                      : "border-muted-foreground/30 hover:border-secondary/50 hover:bg-secondary/5"
                  )}
                >
                  <input {...getFriendPhotoInputProps()} />
                  {friendPhoto ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green" />
                        <p className="text-sm font-display text-foreground">{friendPhoto.name}</p>
                      </div>
                      <img
                        src={URL.createObjectURL(friendPhoto)}
                        alt="Friend photo preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg object-cover shadow-md"
                      />
                    </div>
                    ) : (
                      <div className="space-y-3">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm font-body text-muted-foreground">
                          Arraste a foto do seu amigo aqui ou clique para selecionar
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !zipFile || !userPhoto || !friendPhoto}
              className="w-full h-12 sm:h-14 text-sm sm:text-base font-display bg-gradient-hero hover:opacity-90 text-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Gerar Retrospectiva 2025
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trial Dialog */}
      <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="font-display text-2xl text-center text-foreground">
              Retrospectiva Grátis!
            </DialogTitle>
            <DialogDescription className="font-body text-center text-muted-foreground pt-2">
              Você está criando sua primeira retrospectiva gratuita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-body text-foreground text-center">
                <strong className="text-primary">Importante:</strong> Esta retrospectiva não ficará salva permanentemente.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-body text-foreground">
                Para salvar suas retrospectivas e criar quantas quiser:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm font-body text-muted-foreground ml-2">
                <li>Adicione créditos na sua conta</li>
                <li>Crie retrospectivas ilimitadas</li>
                <li>Salve e compartilhe todas elas</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTrialDialog(false)}
              className="w-full sm:w-auto font-body"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowTrialDialog(false);
                processRetrospective(true);
              }}
              className="w-full sm:w-auto bg-gradient-hero hover:opacity-90 text-foreground font-display"
            >
              Continuar Grátis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
