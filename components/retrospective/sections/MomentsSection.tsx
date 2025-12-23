'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EventCard from '../EventCard';
import DecorativeBlob from '../DecorativeBlob';
import PoweredBy from '../PoweredBy';
import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';

gsap.registerPlugin(ScrollTrigger);

interface MomentsSectionProps {
  textData: RetrospectiveTextData;
}

const MomentsSection = ({ textData }: MomentsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0, scale: 0.9 },
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const colors = ['primary', 'yellow', 'secondary', 'green'] as const;
  const emojis = ['🙈', '🎂', '😎', '👀'];

  const events = textData.melhores_momentos_eventos.map((evento, index) => {
    const [title, ...descParts] = evento.split(': ');
    return {
      emoji: emojis[index] || '✨',
      title: title,
      description: descParts.join(': '),
      color: colors[index % colors.length],
    };
  });

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 section-snap"
    >
      {/* Decorations - smaller on mobile */}
      <DecorativeBlob color="yellow" size="lg" className="absolute top-10 -right-12 opacity-40 w-16 h-16 sm:w-32 sm:h-32" delay={0} />
      <DecorativeBlob color="lime" size="sm" className="absolute top-40 left-2 opacity-60 w-8 h-8 sm:w-16 sm:h-16" delay={0.2} />
      <DecorativeBlob color="coral" size="md" className="absolute bottom-24 -right-8 opacity-40 w-12 h-12 sm:w-24 sm:h-24" delay={0.4} />

      <div ref={titleRef} className="mb-6 sm:mb-8 text-center">
        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">🎭</span>
        <h2 className="font-display text-lg sm:text-xl text-foreground mb-2">Melhores Momentos</h2>
        <p className="text-xs text-muted-foreground font-body">Os eventos que marcaram 2025</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {events.map((event, index) => (
          <EventCard
            key={event.title}
            {...event}
            delay={0.2 + index * 0.15}
          />
        ))}
      </div>

      <PoweredBy />
    </section>
  );
};

export default MomentsSection;

