/**
 * Hook para sincronizar mudanças de tema em tempo real
 * Detecta quando o tema foi alterado em outra aba/rota e recarrega automaticamente
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTeacherTheme } from '@/components/teacher-theme-provider';

export function useThemeSync() {
  const { loadTheme } = useTeacherTheme();

  // Recarregar tema quando a aba ficar visível
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.debug('[useThemeSync] Aba visível, sincronizando tema');
      loadTheme();
    }
  }, [loadTheme]);

  // Recarregar tema quando a janela ganhar foco
  const handleFocus = useCallback(() => {
    console.debug('[useThemeSync] Janela em foco, sincronizando tema');
    loadTheme();
  }, [loadTheme]);

  // Recarregar tema periodicamente (fallback de 5 segundos)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.debug('[useThemeSync] Sincronização periódica de tema');
      loadTheme();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [loadTheme]);

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
