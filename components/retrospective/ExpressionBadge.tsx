'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ExpressionBadgeProps {
  expression: string;
  meaning: string;
  color?: 'primary' | 'blue' | 'green' | 'pink' | 'yellow' | 'coral' | 'secondary' | 'lime';
  delay?: number;
}

const gradientMap: Record<string, string> = {
  primary: 'bg-gradient-hero',
  blue: 'bg-gradient-blue',
  green: 'bg-gradient-green',
  pink: 'bg-gradient-pink',
  yellow: 'bg-gradient-yellow',
  coral: 'bg-gradient-coral',
  secondary: 'bg-gradient-blue',
  lime: 'bg-gradient-green',
};

const ExpressionBadge = ({ expression, meaning, color = 'primary', delay = 0 }: ExpressionBadgeProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!badgeRef.current) return;

    gsap.fromTo(
      badgeRef.current,
      { scale: 0, rotation: -10 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        delay,
        ease: 'elastic.out(1, 0.6)',
      }
    );
  }, [delay]);

  return (
    <div ref={badgeRef} className="text-center">
      <div className={`${gradientMap[color]} rounded-full px-3 sm:px-4 py-1.5 sm:py-2 inline-block mb-1.5 sm:mb-2`}>
        <span className="font-display text-xs sm:text-sm text-foreground break-words">&quot;{expression}&quot;</span>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-body break-words px-2">{meaning}</p>
    </div>
  );
};

export default ExpressionBadge;

