'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GoalCard from '../GoalCard';
import DecorativeBlob from '../DecorativeBlob';
import Squiggle from '../Squiggle';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';

gsap.registerPlugin(ScrollTrigger);

interface GoalsSectionProps {
  textData: RetrospectiveTextData;
}

const GoalsSection = ({ textData }: GoalsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        footerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const colors = ['primary', 'secondary', 'yellow'] as const;

  const goals = textData.metas_proximo_ano.map((meta, index) => ({
    goal: meta,
    color: colors[index % colors.length],
  }));

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 section-snap bg-gradient-to-b from-background via-green/5 to-background"
    >
      {/* Decorations - smaller on mobile */}
      <DecorativeBlob color="primary" size="lg" className="absolute -top-8 -left-16 opacity-40 w-16 h-16 sm:w-32 sm:h-32" delay={0} />
      <DecorativeBlob color="coral" size="md" className="absolute top-48 right-2 opacity-50 w-12 h-12 sm:w-24 sm:h-24" delay={0.2} />
      <DecorativeBlob color="green" size="sm" className="absolute bottom-40 left-4 opacity-60 w-8 h-8 sm:w-16 sm:h-16" delay={0.4} />
      <Squiggle color="green" variant={1} className="absolute bottom-24 right-4 w-12 sm:w-20 opacity-40" delay={0.6} />

      <div ref={titleRef} className="mb-6 sm:mb-10 text-center">
        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">📅</span>
        <h2 className="font-display text-lg sm:text-xl text-foreground mb-2">Metas para 2026</h2>
        <div className="inline-block bg-green/20 rounded-full px-3 sm:px-4 py-1">
          <span className="text-[10px] sm:text-xs text-green font-display">Novo ano, novas aventuras</span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
        {goals.map((goal, index) => (
          <GoalCard
            key={index}
            {...goal}
            delay={0.3 + index * 0.2}
          />
        ))}
      </div>

      {/* Footer */}
      <div ref={footerRef} className="text-center mt-auto">
        <div className="bg-gradient-hero rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
          <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">💖</span>
          <h3 className="font-display text-base sm:text-lg text-foreground mb-1.5 sm:mb-2">
            Obrigado por 2025!
          </h3>
          <p className="text-[10px] sm:text-xs text-foreground/80 font-body break-words px-2">
            {textData.titulo}
          </p>
          <p className="text-[10px] sm:text-xs text-foreground/70 font-body mt-1.5 sm:mt-2 break-words px-2">
            {textData.fechamento}
          </p>
          
          {/* Decorative elements */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-xl sm:text-2xl rotate-12">✨</div>
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-xl sm:text-2xl -rotate-12">🙏</div>
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 font-body">
          Feito com 💛 para celebrar uma amizade especial
        </p>

        <PoweredBy />
      </div>
    </section>
  );
};

export default GoalsSection;

