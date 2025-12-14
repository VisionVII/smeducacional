'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Redireciona uma única vez após login, usando flag em sessionStorage.
 * Se flag não existir, não redireciona e permite navegar páginas públicas.
 */
export function AuthRedirectCheck() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  const clearRedirectFlag = () => {
    try {
      sessionStorage.removeItem('postLoginRedirect');
    } catch (err) {
      console.error('[AuthRedirectCheck] Erro ao limpar flag:', err);
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      return; // Aguardando carregar a sessão
    }

    const hasFlag = (() => {
      try {
        return sessionStorage.getItem('postLoginRedirect') === '1';
      } catch (err) {
        console.error('[AuthRedirectCheck] Erro ao ler flag:', err);
        return false;
      }
    })();

    if (status === 'authenticated' && session?.user?.role && hasFlag) {
      const role = session.user.role;
      let dashboardUrl = '/student/dashboard';

      if (role === 'ADMIN') {
        dashboardUrl = '/admin/dashboard';
      } else if (role === 'TEACHER') {
        dashboardUrl = '/teacher/dashboard';
      }

      clearRedirectFlag();
      router.push(dashboardUrl);
      return;
    }

    setIsChecking(false);
  }, [status, session, router]);

  // Se está verificando ou redirecionando, não mostrar nada
  if (
    isChecking ||
    status === 'loading' ||
    (status === 'authenticated' && session?.user?.role)
  ) {
    return null;
  }

  // Se não está autenticado, renderizar normalmente
  return null;
}
