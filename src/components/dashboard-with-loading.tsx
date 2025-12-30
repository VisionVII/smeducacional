'use client';

import { SlowLoadingPage } from '@/components/slow-loading-page';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Wrapper client para adicionar loading personalizado em student/dashboard
 * Detecta automaticamente carregamentos lentos e mostra tela customizada
 */
export function DashboardWithLoading({ children }: DashboardLayoutProps) {
  return (
    <SlowLoadingPage loadingMessage="Preparando seu dashboard..." delayMs={600}>
      {children}
    </SlowLoadingPage>
  );
}
