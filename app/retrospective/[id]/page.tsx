'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRetrospectiveData } from '@/hooks/use-retrospective-data';
import HeroSection from '@/components/retrospective/sections/HeroSection';
import FriendshipSection from '@/components/retrospective/sections/FriendshipSection';
import MomentsSection from '@/components/retrospective/sections/MomentsSection';
import FunnySection from '@/components/retrospective/sections/FunnySection';
import ExpressionsSection from '@/components/retrospective/sections/ExpressionsSection';
import GoalsSection from '@/components/retrospective/sections/GoalsSection';
import ThemeToggle from '@/components/retrospective/ThemeToggle';
import ShareButton from '@/components/retrospective/ShareButton';

gsap.registerPlugin(ScrollTrigger);

export default function RetrospectivePage() {
  const params = useParams();
  const id = params.id as string;
  const { textData, imageData, loading, error } = useRetrospectiveData(id);

  useEffect(() => {
    // Refresh ScrollTrigger after mount and when data loads
    if (textData && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
  }, [textData, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground font-body">Carregando retrospectiva...</p>
        </div>
      </div>
    );
  }

  if (error || !textData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
        <div className="text-center max-w-md w-full">
          <p className="text-destructive text-base sm:text-lg mb-4 font-body break-words">{error || 'Erro ao carregar retrospectiva'}</p>
          <a
            href="/"
            className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-hero text-foreground rounded-lg hover:opacity-90 transition-opacity font-display text-sm sm:text-base"
          >
            Voltar
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="hide-scrollbar">
      <ThemeToggle />
      <ShareButton />
      <HeroSection textData={textData} imageData={imageData} />
      <FriendshipSection textData={textData} />
      <MomentsSection textData={textData} />
      <FunnySection textData={textData} />
      <ExpressionsSection textData={textData} />
      <GoalsSection textData={textData} />
    </main>
  );
}
