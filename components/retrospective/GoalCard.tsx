'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Check } from 'lucide-react';

interface GoalCardProps {
  goal: string;
  color?: 'primary' | 'blue' | 'green' | 'pink' | 'yellow' | 'coral' | 'secondary' | 'lime';
  delay?: number;
}

const colorMap: Record<string, string> = {
  primary: 'bg-primary',
  blue: 'bg-blue',
  green: 'bg-green',
  pink: 'bg-pink',
  yellow: 'bg-yellow',
  coral: 'bg-coral',
  secondary: 'bg-secondary',
  lime: 'bg-lime',
};

const GoalCard = ({ goal, color = 'primary', delay = 0 }: GoalCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { x: 80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="flex items-center gap-2 sm:gap-3 bg-card rounded-lg sm:rounded-xl p-3 sm:p-4"
    >
      <div className={`${colorMap[color]} w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
      </div>
      <p className="text-xs sm:text-sm text-foreground font-body leading-relaxed break-words">{goal}</p>
    </div>
  );
};

export default GoalCard;

