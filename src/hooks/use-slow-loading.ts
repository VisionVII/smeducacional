'use client';

import { useState, useEffect } from 'react';

interface UseSlowLoadingOptions {
  delayMs?: number; // Tempo mínimo de carregamento antes de mostrar loading
  timeoutMs?: number; // Timeout máximo
}

/**
 * Hook para detectar se um carregamento está demorando
 * Retorna true se carregamento > delayMs
 * Retorna false novamente quando isLoading = false
 */
export function useSlowLoading(
  isLoading: boolean,
  { delayMs = 800, timeoutMs = 30000 }: UseSlowLoadingOptions = {}
) {
  const [showLoading, setShowLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Mostrar loading após delay
      const delay = setTimeout(() => {
        setShowLoading(true);
      }, delayMs);

      // Auto-hide após timeout máximo
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, timeoutMs);

      setTimeoutId(delay);

      return () => {
        clearTimeout(delay);
        clearTimeout(timeout);
      };
    } else {
      // Esconder loading quando terminar
      setShowLoading(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  }, [isLoading, delayMs, timeoutMs, timeoutId]);

  return showLoading;
}
