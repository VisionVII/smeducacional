'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useSlowLoading } from '@/hooks/use-slow-loading';

interface SlowLoadingPageProps {
  children: React.ReactNode;
  loadingMessage?: string;
  delayMs?: number;
}

/**
 * Wrapper para páginas com carregamento lento
 * Detecta automaticamente quando o carregamento está demorando
 * e mostra a tela de loading personalizada
 */
export function SlowLoadingPage({
  children,
  loadingMessage = 'Carregando seu dashboard...',
  delayMs = 800,
}: SlowLoadingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const showLoading = useSlowLoading(isLoading, { delayMs });

  useEffect(() => {
    // Simular fim do carregamento quando a página está pronta
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen show={showLoading} message={loadingMessage} />
      {children}
    </>
  );
}
