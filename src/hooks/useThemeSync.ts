/**
 * Hook para sincronizar mudanças de tema em tempo real
 * Detecta quando o tema foi alterado em outra aba/rota e recarrega automaticamente
 */

'use client';

import { useEffect, useCallback } from 'react';

export function useThemeSync() {
  // Hook simplificado - tema agora gerenciado por ThemeScript SSR
  // Mantido para compatibilidade, mas sem lógica ativa

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.debug('[useThemeSync] Aba visível');
    }
  }, []);

  const handleFocus = useCallback(() => {
    console.debug('[useThemeSync] Janela em foco');
  }, []);

  // Listeners para visibilidade e foco
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleVisibilityChange, handleFocus]);
}
