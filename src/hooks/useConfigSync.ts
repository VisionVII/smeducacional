'use client';

import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para sincronizar configurações e temas do sistema
 * Invalida cache quando mudanças são detectadas
 */
export function useConfigSync() {
  const queryClient = useQueryClient();

  // Invalidar configurações do admin
  const invalidateAdminConfig = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['admin-config'],
    });
  }, [queryClient]);

  // Invalidar tema do professor
  const invalidateTeacherTheme = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['teacher-theme'],
    });
    // Também limpar cache local
    localStorage.removeItem('teacher-theme-cache');
  }, [queryClient]);

  // Invalidar tema do estudante
  const invalidateStudentTheme = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['student-theme'],
    });
    localStorage.removeItem('student-theme-cache');
  }, [queryClient]);

  // Invalidar todas as configurações
  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['admin-config'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['teacher-theme'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['student-theme'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['landing-config'],
      }),
    ]);
  }, [queryClient]);

  // Detectar mudanças em outra aba
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'admin-config-updated' ||
        e.key === 'teacher-theme-updated' ||
        e.key === 'student-theme-updated'
      ) {
        const timestamp = e.newValue;
        console.debug('[useConfigSync] Mudança detectada:', e.key, timestamp);
        invalidateAll();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [invalidateAll]);

  return {
    invalidateAdminConfig,
    invalidateTeacherTheme,
    invalidateStudentTheme,
    invalidateAll,
  };
}

/**
 * Notifica outras abas sobre mudanças
 */
export function broadcastConfigChange(
  type: 'admin' | 'teacher' | 'student' | 'all'
) {
  const timestamp = new Date().toISOString();

  if (type === 'admin' || type === 'all') {
    localStorage.setItem('admin-config-updated', timestamp);
  }

  if (type === 'teacher' || type === 'all') {
    localStorage.setItem('teacher-theme-updated', timestamp);
  }

  if (type === 'student' || type === 'all') {
    localStorage.setItem('student-theme-updated', timestamp);
  }
}
