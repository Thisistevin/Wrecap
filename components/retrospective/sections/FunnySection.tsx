'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EventCard from '../EventCard';
import WhatsAppCard from '../WhatsAppCard';
import DecorativeBlob from '../DecorativeBlob';
import Squiggle from '../Squiggle';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';

gsap.registerPlugin(ScrollTrigger);

interface FunnySectionProps {
  textData: RetrospectiveTextData;
}

const FunnySection = ({ textData }: FunnySectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const { momentos_engracados_piadas } = textData;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0, rotation: -5 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.6)',
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

  const colors = ['coral', 'yellow', 'primary', 'secondary'] as const;
  const emojis = ['👑', '🍳', '🧴', '🔍'];

  const jokes = momentos_engracados_piadas.itens.map((item, index) => {
    // Parse format: "'Title': Description"
    const match = item.match(/^'([^']+)':\s*(.+)$/);
    const title = match ? match[1] : item.split(':')[0];
    const description = match ? match[2] : item.split(':').slice(1).join(':');
    
    return {
      emoji: emojis[index] || '😂',
      title: title,
      description: description.trim(),
      color: colors[index % colors.length],
    };
  });

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 section-snap"
    >
      {/* Decorations - smaller on mobile */}
      <DecorativeBlob color="coral" size="lg" className="absolute -top-8 -left-12 opacity-40 w-16 h-16 sm:w-32 sm:h-32" delay={0} />
      <DecorativeBlob color="yellow" size="md" className="absolute top-40 right-4 opacity-50 w-12 h-12 sm:w-24 sm:h-24" delay={0.2} />
      <Squiggle color="lime" variant={2} className="absolute bottom-40 right-8 w-12 sm:w-20 opacity-40" delay={0.4} />

      <div ref={titleRef} className="mb-6 sm:mb-8 text-center">
        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block wiggle inline-block">😂</span>
        <h2 className="font-display text-lg sm:text-xl text-foreground mb-2">Momentos Engraçados</h2>
        <p className="text-xs text-muted-foreground font-body">& Piadas Internas</p>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {jokes.map((joke, index) => (
          <EventCard
            key={joke.title}
            {...joke}
            delay={0.2 + index * 0.15}
          />
        ))}
      </div>

      <WhatsAppCard
        author={momentos_engracados_piadas.exemplo_real.autor}
        message={momentos_engracados_piadas.exemplo_real.message}
        hour={momentos_engracados_piadas.exemplo_real.hour}
        isReceived={true}
        delay={1}
      />

      <PoweredBy />
    </section>
  );
};

export default FunnySection;

