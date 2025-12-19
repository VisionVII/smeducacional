/**
 * Hook para sincronizar mudanças de tema em tempo real
 * Detecta quando o tema foi alterado em outra aba/rota e recarrega automaticamente
 */

'use client';

import { useEffect } from 'react';

export function useThemeSync() {
  // Hook simplificado - tema agora gerenciado por ThemeScript SSR
  // Mantido para compatibilidade, mas sem lógica ativa

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.debug('[useThemeSync] Aba visível');
    }
  };

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
