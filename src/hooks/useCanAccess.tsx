'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { TeacherAccessControl } from '@/lib/subscription';

/**
 * Hook para verificar acesso a features baseado no plano do professor
 * Reutilizável em qualquer componente client
 *
 * @example
 * const { canUploadLogo, plan, isActive } = useCanAccess();
 * return <button disabled={!canUploadLogo}>Upload Logo</button>
 */
export function useCanAccess() {
  const { data: session, status } = useSession();
  const [access, setAccess] = useState<TeacherAccessControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/teacher/access-control', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch access control: ${response.status}`);
        }

        const data: TeacherAccessControl = await response.json();
        setAccess(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching access control:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();

    // Revalidate a cada 5 minutos (billing pode mudar)
    const interval = setInterval(fetchAccess, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.user?.id, status]);

  // Se não autenticado, retorna acesso livre (free plan)
  const defaultAccess: TeacherAccessControl = {
    isActive: false,
    isTrial: false,
    isExpired: false,
    plan: 'free',
    subscriptionStatus: 'inactive',
    maxStudents: 10,
    maxStorageGB: 1,
    canUploadLogo: false,
    canCustomizeDomain: false,
    canAccessAnalytics: false,
    canUploadVideos: true,
    canCreateCourses: true,
    canManagePayments: false,
    subscriptionExpiresAt: null,
    trialEndsAt: null,
    daysUntilExpiry: null,
  };

  return {
    access: access || defaultAccess,
    loading,
    error,
    isAuthenticated: status === 'authenticated',
  };
}

/**
 * Hook para verificar uma feature específica
 * Mais simples quando só precisa de um booleano
 *
 * @example
 * const canUpload = useFeatureAccess('canUploadLogo');
 * return <button disabled={!canUpload}>Upload</button>
 */
export function useFeatureAccess(
  feature: keyof Omit<
    TeacherAccessControl,
    | 'plan'
    | 'subscriptionStatus'
    | 'maxStudents'
    | 'maxStorageGB'
    | 'subscriptionExpiresAt'
    | 'trialEndsAt'
    | 'daysUntilExpiry'
    | 'isActive'
    | 'isTrial'
    | 'isExpired'
  >
): boolean {
  const { access, loading } = useCanAccess();
  return loading ? false : (access[feature] as boolean);
}

/**
 * Hook para obter informações do plano (sem features)
 * Útil para exibir qual plano está ativo
 *
 * @example
 * const { plan, daysUntilExpiry } = usePlanInfo();
 * return <span>{plan} - Vence em {daysUntilExpiry} dias</span>
 */
export function usePlanInfo() {
  const { access, loading } = useCanAccess();
  return {
    plan: access?.plan || 'free',
    subscriptionStatus: access?.subscriptionStatus || 'inactive',
    isActive: access?.isActive || false,
    isTrial: access?.isTrial || false,
    isExpired: access?.isExpired || false,
    daysUntilExpiry: access?.daysUntilExpiry,
    subscriptionExpiresAt: access?.subscriptionExpiresAt,
    trialEndsAt: access?.trialEndsAt,
    loading,
  };
}

/**
 * Componente wrapper para proteger features
 * Disabilita/esconde conteúdo se feature não está disponível
 *
 * @example
 * <FeatureGate feature="canUploadLogo" fallback={<p>Upgrade necessário</p>}>
 *   <LogoUploadForm />
 * </FeatureGate>
 */
interface FeatureGateProps {
  feature: keyof Omit<
    TeacherAccessControl,
    | 'plan'
    | 'subscriptionStatus'
    | 'maxStudents'
    | 'maxStorageGB'
    | 'subscriptionExpiresAt'
    | 'trialEndsAt'
    | 'daysUntilExpiry'
    | 'isActive'
    | 'isTrial'
    | 'isExpired'
  >;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disabled?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  disabled = false,
}: FeatureGateProps) {
  const hasAccess = useFeatureAccess(feature);

  if (disabled || !hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
