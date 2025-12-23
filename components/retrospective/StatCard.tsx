'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface StatCardProps {
  number: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'blue' | 'green' | 'pink' | 'yellow' | 'coral' | 'secondary' | 'lime';
  delay?: number;
}

const colorMap: Record<string, string> = {
  primary: 'text-primary',
  blue: 'text-blue',
  green: 'text-green',
  pink: 'text-pink',
  yellow: 'text-yellow',
  coral: 'text-coral',
  secondary: 'text-secondary',
  lime: 'text-lime',
};

const bgColorMap: Record<string, string> = {
  primary: 'bg-primary/10',
  blue: 'bg-blue/10',
  green: 'bg-green/10',
  pink: 'bg-pink/10',
  yellow: 'bg-yellow/10',
  coral: 'bg-coral/10',
  secondary: 'bg-secondary/10',
  lime: 'bg-lime/10',
};

const StatCard = ({ number, label, icon, color = 'primary', delay = 0 }: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay,
        ease: 'back.out(1.7)',
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`${bgColorMap[color]} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden`}
    >
      {icon && <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{icon}</span>}
      <span ref={numberRef} className={`font-display text-2xl sm:text-3xl block ${colorMap[color]}`}>
        {number}
      </span>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block font-body leading-tight">{label}</span>
    </div>
  );
};

export default StatCard;

