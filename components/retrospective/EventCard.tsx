'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface EventCardProps {
  emoji: string;
  title: string;
  description: string;
  color?: 'primary' | 'blue' | 'green' | 'pink' | 'yellow' | 'coral' | 'secondary' | 'lime';
  delay?: number;
}

const borderColorMap: Record<string, string> = {
  primary: 'border-primary',
  blue: 'border-blue',
  green: 'border-green',
  pink: 'border-pink',
  yellow: 'border-yellow',
  coral: 'border-coral',
  secondary: 'border-secondary',
  lime: 'border-lime',
};

const EventCard = ({ emoji, title, description, color = 'primary', delay = 0 }: EventCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { 
        x: -60, 
        opacity: 0,
        rotation: -5,
      },
      {
        x: 0,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`bg-card border-l-4 ${borderColorMap[color]} rounded-lg sm:rounded-xl p-3 sm:p-4 relative`}
    >
      <div className="flex gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl flex-shrink-0 wiggle">{emoji}</span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-xs sm:text-sm text-foreground mb-1 break-words">{title}</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-body leading-relaxed break-words">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

