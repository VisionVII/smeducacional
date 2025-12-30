import { prisma } from '@/lib/db';

export type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface UserPlanInfo {
  planId: string;
  tier: PlanTier;
  features: string[];
  isActive: boolean;
  renewalDate?: Date;
}

/**
 * Determina o plano ativo do usuário baseado no role e subscrição.
 * Retorna um PlanInfo com tier e features habilitadas.
 */
export async function getUserPlanInfo(
  userId: string,
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
): Promise<UserPlanInfo> {
  // Admins sempre têm acesso completo
  if (role === 'ADMIN') {
    return {
      planId: 'admin-full',
      tier: 'enterprise',
      features: [
        'ai-assistant',
        'mentorships',
        'pro-tools',
        'analytics',
        'audit',
      ],
      isActive: true,
    };
  }

  if (role === 'TEACHER') {
    const subscription = await prisma.teacherSubscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== 'active') {
      // Free tier para teachers
      return {
        planId: 'teacher-free',
        tier: 'free',
        features: [],
        isActive: false,
      };
    }

    const tierFeatureMap: Record<string, string[]> = {
      basic: ['ai-assistant'],
      premium: ['ai-assistant', 'mentorships', 'pro-tools'],
      enterprise: ['ai-assistant', 'mentorships', 'pro-tools', 'analytics'],
    };

    return {
      planId: subscription.id,
      tier: (subscription.plan as PlanTier) || 'free',
      features: tierFeatureMap[subscription.plan] || [],
      isActive: subscription.status === 'active',
      renewalDate: subscription.renewDate ?? undefined,
    };
  }

  // role === 'STUDENT'
  const subscription = await prisma.studentSubscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.status !== 'active') {
    return {
      planId: 'student-free',
      tier: 'free',
      features: [],
      isActive: false,
    };
  }

  const tierFeatureMap: Record<string, string[]> = {
    basic: ['ai-assistant'],
    premium: ['ai-assistant', 'mentorships', 'pro-tools'],
  };

  return {
    planId: subscription.id,
    tier: (subscription.plan as PlanTier) || 'free',
    features: tierFeatureMap[subscription.plan] || [],
    isActive: subscription.status === 'active',
    renewalDate: subscription.currentPeriodEnd ?? undefined,
  };
}

/**
 * Valida se um feature está disponível no plano ativo do usuário.
 */
export async function hasFeatureAccess(
  userId: string,
  role: 'STUDENT' | 'TEACHER' | 'ADMIN',
  featureId: string
): Promise<boolean> {
  const plan = await getUserPlanInfo(userId, role);
  return plan.features.includes(featureId);
}
