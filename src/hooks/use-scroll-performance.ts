/**
 * Hook para otimizar performance durante scroll
 * Desabilita animações e transições enquanto usuario está fazendo scroll
 */

import { useState, useEffect } from 'react';

export function useScrollPerformance() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        // Desabilita transitions via CSS custom property
        document.documentElement.style.setProperty(
          '--transition-duration',
          '0ms'
        );
      }

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
        // Re-habilita transitions
        document.documentElement.style.setProperty(
          '--transition-duration',
          '200ms'
        );
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isScrolling]);

  return { isScrolling };
}
