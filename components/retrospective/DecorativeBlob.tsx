'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface DecorativeBlobProps {
  color: 'primary' | 'pink' | 'yellow' | 'green' | 'blue' | 'coral' | 'secondary' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

const colorMap: Record<string, string> = {
  primary: 'bg-primary',
  pink: 'bg-pink',
  yellow: 'bg-yellow',
  green: 'bg-green',
  blue: 'bg-blue',
  coral: 'bg-coral',
  secondary: 'bg-secondary',
  lime: 'bg-lime',
};

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const DecorativeBlob = ({ color, size = 'md', className = '', delay = 0 }: DecorativeBlobProps) => {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!blobRef.current) return;

    // Ensure element is visible before animating
    gsap.set(blobRef.current, { opacity: 0, scale: 0 });

    gsap.fromTo(
      blobRef.current,
      { scale: 0, rotation: -20, opacity: 0 },
      {
        scale: 1,
        rotation: 0,
        opacity: 0.8,
        duration: 0.8,
        delay,
        ease: 'elastic.out(1, 0.5)',
      }
    );

    // Continuous floating animation
    gsap.to(blobRef.current, {
      y: -15,
      rotation: 5,
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay + 0.8,
    });
  }, [delay]);

  return (
    <div
      ref={blobRef}
      className={`blob-shape ${colorMap[color]} ${sizeMap[size]} ${className}`}
      style={{ opacity: 0 }} // Will be animated by GSAP
    />
  );
};

export default DecorativeBlob;

