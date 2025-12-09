'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Componente que redireciona usuários logados para o dashboard correto
 * baseado no seu role (admin, teacher, student)
 */
export function AuthRedirectCheck() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return; // Aguardando carregar a sessão
    }

    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role;
      let dashboardUrl = '/student/dashboard';

      if (role === 'ADMIN') {
        dashboardUrl = '/admin/dashboard';
      } else if (role === 'TEACHER') {
        dashboardUrl = '/teacher/dashboard';
      }

      console.log(
        `[AuthRedirectCheck] Redirecionando usuário ${session.user.email} (${role}) para ${dashboardUrl}`
      );
      router.push(dashboardUrl);
    } else {
      setIsChecking(false);
    }
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
