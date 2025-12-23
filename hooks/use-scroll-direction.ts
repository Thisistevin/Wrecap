import { useState, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY || window.pageYOffset;

      // Ignore very small scroll movements
      if (Math.abs(scrollY - lastScrollY.current) < 10) {
        ticking.current = false;
        return;
      }

      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      setScrollDirection(direction);
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Set initial scroll position
    lastScrollY.current = window.scrollY || window.pageYOffset;

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return scrollDirection;
}

