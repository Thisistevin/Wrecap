'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareDialog = ({ open, onOpenChange }: ShareDialogProps) => {
  const params = useParams();
  const retrospectiveId = params.id as string;
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/retrospective/${retrospectiveId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`Confira minha retrospectiva de 2025! 🎉\n\n${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Retrospectiva 2025',
          text: 'Confira minha retrospectiva de 2025! 🎉',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Compartilhar Retrospectiva
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            Compartilhe sua retrospectiva com seus amigos!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Link Input */}
          <div className="space-y-2">
            <label className="text-sm font-display text-foreground">
              Link da retrospectiva
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green font-body">Link copiado! ✓</p>
            )}
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-display text-foreground">
              Compartilhar em
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp */}
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                className="flex items-center gap-2 font-body bg-green/10 hover:bg-green/20 border-green/30 text-green"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>

              {/* Native Share (if available) */}
              {navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  className="flex items-center gap-2 font-body"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;

