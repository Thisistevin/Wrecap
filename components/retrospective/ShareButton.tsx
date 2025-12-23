'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import gsap from 'gsap';
import ShareDialog from './ShareDialog';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const ShareButton = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollDirection = useScrollDirection();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!buttonRef.current) return;
    
    // Initial animation
    gsap.fromTo(
      buttonRef.current,
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        delay: 1.2,
        ease: 'elastic.out(1, 0.5)',
      }
    );
  }, []);

  useEffect(() => {
    if (!buttonRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Always show at the top
      if (scrollY < 50) {
        setIsVisible(true);
        gsap.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        return;
      }

      if (scrollDirection === 'down') {
        setIsVisible(false);
        gsap.to(buttonRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 10,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else if (scrollDirection === 'up') {
        setIsVisible(true);
        gsap.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection]);

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card border border-border shadow-lg flex items-center justify-center transition-colors hover:bg-muted touch-manipulation"
        size="icon"
        aria-label="Compartilhar retrospectiva"
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </Button>
      <ShareDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ShareButton;

