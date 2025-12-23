'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface SquiggleProps {
  color: 'primary' | 'pink' | 'yellow' | 'green' | 'blue' | 'coral' | 'foreground' | 'secondary' | 'lime';
  variant?: 1 | 2 | 3 | 4;
  className?: string;
  delay?: number;
}

const colorMap: Record<string, string> = {
  primary: 'stroke-primary',
  pink: 'stroke-pink',
  yellow: 'stroke-yellow',
  green: 'stroke-green',
  blue: 'stroke-blue',
  coral: 'stroke-coral',
  foreground: 'stroke-foreground',
  secondary: 'stroke-secondary',
  lime: 'stroke-lime',
};

const Squiggle = ({ color, variant = 1, className = '', delay = 0 }: SquiggleProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const path = svgRef.current.querySelector('path');
    if (!path) return;

    // Ensure element is visible
    gsap.set(svgRef.current, { opacity: 0 });
    gsap.set(path, { opacity: 0 });

    const length = path.getTotalLength();
    
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // Fade in and draw
    gsap.to([svgRef.current, path], {
      opacity: 1,
      duration: 0.3,
      delay,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.2,
      delay,
      ease: 'power2.out',
    });

    gsap.to(svgRef.current, {
      rotation: 5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay + 1.2,
    });
  }, [delay]);

  const paths = {
    1: "M10 40 Q 30 10, 50 40 T 90 40",
    2: "M10 25 C 30 5, 50 45, 70 25 S 110 45, 130 25",
    3: "M10 50 Q 35 10, 60 50 Q 85 90, 110 50",
    4: "M10 30 L 30 50 L 50 30 L 70 50 L 90 30",
  };

  return (
    <svg
      ref={svgRef}
      className={`${className}`}
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={paths[variant]}
        className={colorMap[color]}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Squiggle;

