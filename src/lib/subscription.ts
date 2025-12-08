import { prisma } from '@/lib/db';

/**
 * Status de Plano do Professor
 * Define quais features estão disponíveis para cada nível
 */
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'suspended';

export interface TeacherAccessControl {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  maxStudents: number;
  maxStorageGB: number;

  // Feature Flags
  canUploadLogo: boolean;
  canCustomizeDomain: boolean;
  canAccessAnalytics: boolean;
  canUploadVideos: boolean;
  canCreateCourses: boolean;
  canManagePayments: boolean;

  // Datas
  subscriptionExpiresAt: Date | null;
  trialEndsAt: Date | null;
  daysUntilExpiry: number | null;
}

/**
 * Configurações por Plano
 * Define limites e features para cada nível
 */
const PLAN_FEATURES: Record<PlanType, Partial<TeacherAccessControl>> = {
  free: {
    plan: 'free',
    maxStudents: 10,
    maxStorageGB: 1,
    canUploadLogo: false,
    canCustomizeDomain: false,
    canAccessAnalytics: false,
    canUploadVideos: true,
    canCreateCourses: true,
    canManagePayments: false,
  },
  basic: {
    plan: 'basic',
    maxStudents: 50,
    maxStorageGB: 10,
    canUploadLogo: true,
    canCustomizeDomain: false,
    canAccessAnalytics: true,
    canUploadVideos: true,
    canCreateCourses: true,
    canManagePayments: false,
  },
  premium: {
    plan: 'premium',
    maxStudents: 300,
    maxStorageGB: 100,
    canUploadLogo: true,
    canCustomizeDomain: true,
    canAccessAnalytics: true,
    canUploadVideos: true,
    canCreateCourses: true,
    canManagePayments: false,
  },
  enterprise: {
    plan: 'enterprise',
    maxStudents: 10000,
    maxStorageGB: 1000,
    canUploadLogo: true,
    canCustomizeDomain: true,
    canAccessAnalytics: true,
    canUploadVideos: true,
    canCreateCourses: true,
    canManagePayments: true,
  },
};

/**
 * Obtém status completo de acesso do professor
 * @param userId ID do usuário
 * @returns Estado de acesso com feature flags
 */
export async function getTeacherAccessControl(
  userId: string
): Promise<TeacherAccessControl> {
  const financial = await prisma.teacherFinancial.findUnique({
    where: { userId },
  });

  if (!financial) {
    // Professor sem registro financeiro = plano free
    return {
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
  }

  const now = new Date();
  const isExpired =
    financial.subscriptionExpiresAt && financial.subscriptionExpiresAt < now;
  const isTrialEnded = financial.trialEndsAt && financial.trialEndsAt < now;
  const isActive =
    financial.subscriptionStatus === 'active' &&
    !isExpired &&
    financial.subscriptionExpiresAt &&
    financial.subscriptionExpiresAt > now;
  const isTrial =
    financial.subscriptionStatus === 'trial' &&
    financial.trialEndsAt &&
    financial.trialEndsAt > now;

  const daysUntilExpiry = isActive
    ? Math.ceil(
        (financial.subscriptionExpiresAt!.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const features =
    PLAN_FEATURES[financial.plan as PlanType] || PLAN_FEATURES.free;

  return {
    isActive: isActive || false,
    isTrial: isTrial || false,
    isExpired: isExpired || false,
    plan: (financial.plan as PlanType) || 'free',
    subscriptionStatus:
      (financial.subscriptionStatus as SubscriptionStatus) || 'inactive',
    maxStudents: financial.maxStudents,
    maxStorageGB: Math.floor(financial.maxStorage / 1024), // Converter MB para GB

    // Se expirou, desabilita tudo
    canUploadLogo: !isExpired
      ? financial.canUploadLogo || features.canUploadLogo || false
      : false,
    canCustomizeDomain: !isExpired
      ? financial.canCustomizeDomain || features.canCustomizeDomain || false
      : false,
    canAccessAnalytics: !isExpired
      ? financial.canAccessAnalytics || features.canAccessAnalytics || false
      : false,
    canUploadVideos: !isExpired ? features.canUploadVideos || true : false,
    canCreateCourses: !isExpired ? features.canCreateCourses || true : false,
    canManagePayments: !isExpired ? features.canManagePayments || false : false,

    subscriptionExpiresAt: financial.subscriptionExpiresAt,
    trialEndsAt: financial.trialEndsAt,
    daysUntilExpiry,
  };
}

/**
 * Verifica se professor pode realizar uma ação específica
 * @param userId ID do usuário
 * @param feature Feature a verificar
 * @returns boolean indicando se feature está disponível
 */
export async function canAccessFeature(
  userId: string,
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
): Promise<boolean> {
  const access = await getTeacherAccessControl(userId);
  return access[feature] as boolean;
}

/**
 * Verifica se professor tem plano ativo (não expirado)
 * @param userId ID do usuário
 * @returns boolean
 */
export async function hasActivePlan(userId: string): Promise<boolean> {
  const access = await getTeacherAccessControl(userId);
  return access.isActive || access.isTrial;
}

/**
 * Simula uma ativação de plano (usar com Stripe/payment provider)
 * @param userId ID do usuário
 * @param plan Plano a ativar
 * @param durationDays Duração em dias
 */
export async function activatePlan(
  userId: string,
  plan: PlanType,
  durationDays: number = 30
): Promise<TeacherAccessControl> {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  const financial = await prisma.teacherFinancial.update({
    where: { userId },
    data: {
      subscriptionStatus: 'active' as string,
      plan: plan as string,
      subscriptionStartDate: now,
      subscriptionExpiresAt: expiresAt,
      lastPaymentDate: now,
    },
  });

  return getTeacherAccessControl(userId);
}

/**
 * Simula uma ativação de trial
 * @param userId ID do usuário
 * @param durationDays Duração do trial em dias
 */
export async function activateTrial(
  userId: string,
  durationDays: number = 7
): Promise<TeacherAccessControl> {
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await prisma.teacherFinancial.update({
    where: { userId },
    data: {
      subscriptionStatus: 'trial' as string,
      trialEndsAt: endsAt,
    },
  });

  return getTeacherAccessControl(userId);
}

/**
 * Cancela plano do professor
 * @param userId ID do usuário
 */
export async function cancelPlan(
  userId: string
): Promise<TeacherAccessControl> {
  await prisma.teacherFinancial.update({
    where: { userId },
    data: {
      subscriptionStatus: 'inactive' as string,
      subscriptionExpiresAt: null,
      trialEndsAt: null,
    },
  });

  return getTeacherAccessControl(userId);
}
