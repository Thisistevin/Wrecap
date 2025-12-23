'use client';

import { Moon, Sun } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const ThemeToggle = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollDirection = useScrollDirection();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!buttonRef.current) return;
    
    gsap.fromTo(
      buttonRef.current,
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        delay: 1,
        ease: 'elastic.out(1, 0.5)',
      }
    );
  }, []);

  useEffect(() => {
    if (!buttonRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Always show at the top
      if (scrollY < 50) {
        setIsVisible(true);
        gsap.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        return;
      }

      if (scrollDirection === 'down') {
        setIsVisible(false);
        gsap.to(buttonRef.current, {
          opacity: 0,
          scale: 0.8,
          y: -10,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else if (scrollDirection === 'up') {
        setIsVisible(true);
        gsap.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection]);

  const handleClick = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        rotation: '+=360',
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    
    // Toggle theme
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center transition-colors hover:bg-muted touch-manipulation"
      aria-label="Toggle theme"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;

