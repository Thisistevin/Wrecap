'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface QuoteCardProps {
  author: string;
  message: string;
  hour: string;
  color?: 'primary' | 'blue' | 'green' | 'pink';
  delay?: number;
}

const gradientMap = {
  primary: 'bg-gradient-hero',
  blue: 'bg-gradient-blue',
  green: 'bg-gradient-green',
  pink: 'bg-gradient-pink',
};

const QuoteCard = ({ author, message, hour, color = 'primary', delay = 0 }: QuoteCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { 
        x: 50, 
        opacity: 0,
        scale: 0.9,
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`${gradientMap[color]} rounded-xl sm:rounded-2xl p-3 sm:p-4 card-shine relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
        <span className="font-display text-xs sm:text-sm text-foreground opacity-90 truncate flex-1">{author}</span>
        <span className="text-[10px] sm:text-xs text-foreground/60 flex-shrink-0">{hour}</span>
      </div>
      <p className="text-foreground text-xs sm:text-sm leading-relaxed font-body break-words">{message}</p>
      
      {/* Decorative corner */}
      <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-foreground/10" />
    </div>
  );
};

export default QuoteCard;

