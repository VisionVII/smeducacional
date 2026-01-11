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
 * DISABLED: Wrapper para páginas com carregamento lento
 * PROBLEMA: Estava causando bloqueio de página
 * SOLUÇÃO: Renderizar children diretamente, sem overlay
 */
export function SlowLoadingPage({
  children,
  loadingMessage = 'Carregando seu dashboard...',
  delayMs = 800,
}: SlowLoadingPageProps) {
  // DISABLED: Não renderizar loading screen
  // apenas renderizar children normalmente

  return <>{children}</>;
}
