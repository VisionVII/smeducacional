/**
 * useOverlayProtection - Hook de Segurança Global
 * Previne que overlays bloqueiem a página permanentemente
 */

import { useEffect } from 'react';

interface OverlayProtectionOptions {
  maxDurationMs?: number; // Máximo tempo que overlay pode ficar visível
  enableEscapeKey?: boolean;
  onTimeout?: () => void;
}

export function useOverlayProtection(
  enabled: boolean,
  options: OverlayProtectionOptions = {}
) {
  const {
    maxDurationMs = 30000, // 30 segundos padrão
    enableEscapeKey = true,
    onTimeout,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    // Safety timeout para forçar esconder overlay
    const timeoutId = setTimeout(() => {
      console.warn(
        `[useOverlayProtection] Safety timeout reached (${maxDurationMs}ms) - overlay was visible too long`
      );
      onTimeout?.();

      // Força esconder elementos overlay
      document.querySelectorAll('[data-state="open"], .fixed.inset-0, [role="dialog"]').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
          console.log('[useOverlayProtection] Força escondido:', el.className);
        }
      });

      // Restaurar scroll
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }, maxDurationMs);

    // ESC key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enableEscapeKey && e.key === 'Escape') {
        console.log('[useOverlayProtection] ESC key pressed');
        clearTimeout(timeoutId);
        onTimeout?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, maxDurationMs, enableEscapeKey, onTimeout]);
}
