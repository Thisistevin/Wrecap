'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Using regular img tag for external Firebase Storage URLs

gsap.registerPlugin(ScrollTrigger);
import DecorativeBlob from '../DecorativeBlob';
import Squiggle from '../Squiggle';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData, RetrospectiveImageData } from '@/hooks/use-retrospective-data';
import { parseRetrospectiveData } from '@/lib/retrospective-utils';

interface HeroSectionProps {
  textData: RetrospectiveTextData;
  imageData: RetrospectiveImageData | null;
}

const HeroSection = ({ textData, imageData }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  const { primeiroNome, segundoNome, caracteristica1, caracteristica2, caracteristica3, totalDeDias } = parseRetrospectiveData(textData);

  // Debug: log image data
  // Removed debug logs for production

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Year animation
      gsap.fromTo(
        yearRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.2,
        }
      );

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.8,
        }
      );

      // Photos animation - wait a bit to ensure images are in DOM
      if (photosRef.current) {
        const photos = photosRef.current.querySelectorAll('.profile-photo');
        if (photos.length > 0) {
          gsap.fromTo(
            photos,
            { scale: 0, rotation: -20, opacity: 0 },
            {
              scale: 1,
              rotation: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'elastic.out(1, 0.6)',
              stagger: 0.15,
              delay: 0.3,
            }
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Re-run animations when images load
  useEffect(() => {
    if (imageData && photosRef.current) {
      const photos = photosRef.current.querySelectorAll('.profile-photo');
      if (photos.length > 0) {
        // Refresh animations when images are available
        ScrollTrigger.refresh();
      }
    }
  }, [imageData]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12 section-snap"
    >
      {/* Background decorations - smaller on mobile */}
      <DecorativeBlob color="primary" size="lg" className="absolute top-10 -left-10 opacity-50 w-16 h-16 sm:w-32 sm:h-32" delay={0.2} />
      <DecorativeBlob color="lime" size="md" className="absolute top-32 right-4 w-12 h-12 sm:w-24 sm:h-24" delay={0.4} />
      <DecorativeBlob color="yellow" size="sm" className="absolute bottom-40 -left-4 w-8 h-8 sm:w-16 sm:h-16" delay={0.6} />
      <DecorativeBlob color="green" size="md" className="absolute bottom-20 right-8 w-12 h-12 sm:w-24 sm:h-24" delay={0.8} />
      <DecorativeBlob color="blue" size="sm" className="absolute top-1/2 right-2 w-8 h-8 sm:w-16 sm:h-16" delay={1} />
      
      <Squiggle color="foreground" variant={1} className="absolute top-20 right-8 w-12 sm:w-20 opacity-30" delay={1.2} />
      <Squiggle color="foreground" variant={2} className="absolute bottom-32 left-8 w-16 sm:w-24 opacity-30" delay={1.4} />

      {/* Main content */}
      <div className="text-center relative z-10">
        <span
          ref={yearRef}
          className="inline-block font-display text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] text-gradient-hero mb-2 leading-none"
        >
          {textData.metricas_temporais.fim.split('/')[2] || '2025'}
        </span>
        
        <div className="inline-block bg-gradient-hero rounded-full px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-2.5 mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm md:text-base lg:text-lg font-display text-foreground tracking-wider">RETROSPECTIVA</span>
        </div>

        {/* Profile Photos - Always render like original */}
        <div ref={photosRef} className="flex justify-center items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="profile-photo relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary shadow-xl shadow-primary/40 bg-muted">
              {imageData?.secondaryImage && imageData.secondaryImage.trim() !== '' ? (
                <img 
                  src={imageData.secondaryImage} 
                  alt={primeiroNome}
                  className="w-full h-full object-cover"
                  loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                />
              ) : null}
              {(!imageData?.secondaryImage || imageData.secondaryImage === '') && (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-2xl font-display">{primeiroNome.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs sm:text-sm font-display px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              {primeiroNome}
            </span>
          </div>
          
          <div className="profile-photo relative -ml-4 sm:-ml-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-secondary shadow-xl shadow-secondary/40 bg-muted">
              {imageData?.mainImage && imageData.mainImage.trim() !== '' ? (
                <img 
                  src={imageData.mainImage} 
                  alt={segundoNome}
                  className="w-full h-full object-cover"
                  loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                />
              ) : null}
              {(!imageData?.mainImage || imageData.mainImage === '') && (
                <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                  <span className="text-secondary text-2xl font-display">{segundoNome.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs sm:text-sm font-display px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              {segundoNome}
            </span>
          </div>
        </div>
        
        <h1
          ref={titleRef}
          className="font-display text-xl sm:text-2xl md:text-4xl text-foreground leading-tight mb-4 sm:mb-6 px-2"
          dangerouslySetInnerHTML={{ 
            __html: textData.titulo 
          }}
        />
        
        <p
          ref={subtitleRef}
          className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto font-body leading-relaxed px-4"
        >
          Uma jornada de <span className="text-primary font-semibold">{totalDeDias} dias</span> marcada por{' '}
          <span className="text-secondary font-semibold">{caracteristica1}</span>,{' '}
          <span className="text-green font-semibold">{caracteristica2}</span> e muitas{' '}
          <span className="text-yellow font-semibold">{caracteristica3}</span>.
        </p>

        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full mx-auto flex justify-center">
            <div className="w-1.5 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse" />
          </div>
          <span className="text-xs text-muted-foreground mt-2 block">role para baixo</span>
        </div>

        <PoweredBy />
      </div>
    </section>
  );
};

export default HeroSection;

