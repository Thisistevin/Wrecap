'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExpressionBadge from '../ExpressionBadge';
import DecorativeBlob from '../DecorativeBlob';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';

gsap.registerPlugin(ScrollTrigger);

interface ExpressionsSectionProps {
  textData: RetrospectiveTextData;
}

const ExpressionsSection = ({ textData }: ExpressionsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const colors = ['primary', 'secondary', 'yellow', 'green'] as const;

  const expressions = textData.expressoes_internas.map((item, index) => {
    // Parse format: "'Expression': Meaning"
    const match = item.match(/^'([^']+)':\s*(.+)$/);
    const expression = match ? match[1] : item.split(':')[0];
    const meaning = match ? match[2] : item.split(':').slice(1).join(':');
    
    return {
      expression: expression,
      meaning: meaning.trim(),
      color: colors[index % colors.length],
    };
  });

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 section-snap"
    >
      {/* Decorations - smaller on mobile */}
      <DecorativeBlob color="green" size="lg" className="absolute top-16 -right-12 opacity-40 w-16 h-16 sm:w-32 sm:h-32" delay={0} />
      <DecorativeBlob color="secondary" size="md" className="absolute bottom-32 -left-10 opacity-50 w-12 h-12 sm:w-24 sm:h-24" delay={0.2} />
      <DecorativeBlob color="yellow" size="sm" className="absolute top-1/3 left-4 opacity-60 w-8 h-8 sm:w-16 sm:h-16" delay={0.4} />

      <div ref={titleRef} className="mb-6 sm:mb-10 text-center">
        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">🗣️</span>
        <h2 className="font-display text-lg sm:text-xl text-foreground mb-2">Expressões Internas</h2>
        <p className="text-xs text-muted-foreground font-body">O Dicionário de Vocês</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {expressions.map((exp, index) => (
          <ExpressionBadge
            key={exp.expression}
            {...exp}
            delay={0.3 + index * 0.15}
          />
        ))}
      </div>

      {/* Fun dictionary book illustration */}
      <div className="mt-6 sm:mt-10 flex justify-center">
        <div className="bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border border-border">
          <span className="text-2xl sm:text-3xl">📖</span>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body">
              <span className="text-primary font-semibold">{expressions.length} termos</span> oficialmente catalogados
            </p>
          </div>
        </div>
      </div>

      <PoweredBy />
    </section>
  );
};

export default ExpressionsSection;

