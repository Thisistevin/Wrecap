'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StatCard from '../StatCard';
import WhatsAppCard from '../WhatsAppCard';
import DecorativeBlob from '../DecorativeBlob';
import Squiggle from '../Squiggle';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';
import { parseRetrospectiveData } from '@/lib/retrospective-utils';

gsap.registerPlugin(ScrollTrigger);

interface FriendshipSectionProps {
  textData: RetrospectiveTextData;
}

const FriendshipSection = ({ textData }: FriendshipSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { diasConversados, pilar1, pilar2, pilar3, porqueDoNome, totalDeDias } = parseRetrospectiveData(textData);
  const { tipo_de_amizade } = textData;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 section-snap"
    >
      {/* Decorations - smaller on mobile */}
      <DecorativeBlob color="blue" size="lg" className="absolute -top-10 -right-16 opacity-40 w-16 h-16 sm:w-32 sm:h-32" delay={0} />
      <DecorativeBlob color="green" size="md" className="absolute bottom-20 -left-8 opacity-50 w-12 h-12 sm:w-24 sm:h-24" delay={0.2} />
      <Squiggle color="blue" variant={3} className="absolute top-32 left-4 w-10 sm:w-16 opacity-50" delay={0.4} />

      <div ref={titleRef} className="mb-6 sm:mb-8 text-center">
        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">🤝</span>
        <h2 className="font-display text-lg sm:text-xl text-foreground mb-2">A Dinâmica da Amizade</h2>
        <div className="inline-block bg-secondary/20 rounded-full px-2 sm:px-3 py-1">
          <span className="text-[10px] sm:text-xs text-secondary font-body break-words">{tipo_de_amizade.nome_criativo}</span>
        </div>
      </div>

      <div ref={contentRef} className="space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard number={totalDeDias} label="dias juntos" icon="📅" color="primary" delay={0.2} />
          <StatCard number={diasConversados} label="dias de conversa" icon="💬" color="secondary" delay={0.4} />
          <StatCard number="∞" label="risadas" icon="😂" color="coral" delay={0.6} />
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed break-words">
            A amizade se sustenta: {' '}
            <span className="text-green font-semibold">{pilar1}</span>
            , {' '}
            <span className="text-primary font-semibold">{pilar2}</span> {' '}
            e <span className="text-secondary font-semibold">&quot;{pilar3}&quot;</span>.
          </p>
        </div>

        {/* WhatsApp Message */}
        <WhatsAppCard
          author={tipo_de_amizade.exemplo_real.autor}
          message={tipo_de_amizade.exemplo_real.message}
          hour={tipo_de_amizade.exemplo_real.hour}
          isReceived={true}
          delay={0.8}
        />

        {/* Anchor explanation */}
        <div className="bg-primary/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-lg sm:text-xl">⚓</span>
            <span className="font-display text-xs sm:text-sm text-primary">Por que esse nome?</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-body leading-relaxed break-words">
            {porqueDoNome}
          </p>
        </div>

        <PoweredBy />
      </div>
    </section>
  );
};

export default FriendshipSection;

