/**
 * Feature Gating Service - VisionVII
 * Controla acesso a cursos pagos e features de assinatura
 */

import { prisma } from '@/lib/db';

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  course?: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
  };
}

/**
 * Verifica se o usuário pode acessar um curso pago
 */
export async function canAccessCourse(
  userId: string,
  courseId: string
): Promise<AccessResult> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      isPaid: true,
      price: true,
      compareAtPrice: true,
      instructorId: true,
    },
  });

  if (!course) {
    return {
      allowed: false,
      reason: 'course_not_found',
    };
  }

  // Se é o próprio instrutor, sempre permitir
  if (course.instructorId === userId) {
    return { allowed: true };
  }

  // Curso gratuito - acesso liberado
  if (!course.isPaid || !course.price || course.price === 0) {
    return { allowed: true };
  }

  // Verificar enrollment ativo
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId,
      },
    },
    select: { status: true },
  });

  if (enrollment?.status === 'ACTIVE') {
    return { allowed: true };
  }

  // Curso pago e sem enrollment - bloquear
  return {
    allowed: false,
    reason: 'course_not_purchased',
    course: {
      id: course.id,
      title: course.title,
      price: course.price,
      compareAtPrice: course.compareAtPrice,
    },
  };
}

/**
 * Verifica se o professor pode criar um novo curso
 */
export async function canCreateCourse(userId: string): Promise<AccessResult> {
  const teacher = await prisma.teacherFinancial.findUnique({
    where: { userId },
    select: {
      subscriptionStatus: true,
      plan: true,
    },
  });

  // Se não tem registro financeiro, criar com plano free
  if (!teacher) {
    await prisma.teacherFinancial.create({
      data: {
        userId,
        plan: 'free',
        subscriptionStatus: 'active',
        bank: '',
        agency: '',
        account: '',
        accountType: 'Corrente',
      },
    });
    return { allowed: true };
  }

  // Verificar se assinatura está ativa
  if (teacher.subscriptionStatus !== 'active') {
    return {
      allowed: false,
      reason: 'subscription_inactive',
    };
  }

  // Contar cursos publicados
  const courseCount = await prisma.course.count({
    where: {
      instructorId: userId,
      isPublished: true,
    },
  });

  // Limites por plano
  const limits: Record<string, number> = {
    free: 1,
    basic: 5,
    premium: 20,
    enterprise: Infinity,
  };

  const maxCourses = limits[teacher.plan] || 1;

  if (courseCount >= maxCourses) {
    return {
      allowed: false,
      reason: 'course_limit_reached',
    };
  }

  return { allowed: true };
}

/**
 * Verifica se o professor pode fazer upload de vídeo
 */
export async function canUploadVideo(
  userId: string,
  fileSizeMB: number
): Promise<AccessResult & { used?: number; max?: number }> {
  const teacher = await prisma.teacherFinancial.findUnique({
    where: { userId },
    select: {
      subscriptionStatus: true,
      maxStorage: true,
    },
  });

  if (!teacher) {
    return {
      allowed: false,
      reason: 'teacher_not_found',
    };
  }

  if (teacher.subscriptionStatus !== 'active') {
    return {
      allowed: false,
      reason: 'subscription_inactive',
    };
  }

  // Calcular storage usado (simplificado - deveria somar todos os vídeos)
  // TODO: Implementar cálculo real somando tamanhos de Material
  const usedStorage = 0; // Placeholder

  if (usedStorage + fileSizeMB > teacher.maxStorage) {
    return {
      allowed: false,
      reason: 'storage_limit_exceeded',
      used: usedStorage,
      max: teacher.maxStorage,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se o professor pode acessar analytics
 */
export async function canAccessAnalytics(userId: string): Promise<boolean> {
  const teacher = await prisma.teacherFinancial.findUnique({
    where: { userId },
    select: {
      plan: true,
      canAccessAnalytics: true,
    },
  });

  if (!teacher) return false;

  return (
    teacher.canAccessAnalytics ||
    ['premium', 'enterprise'].includes(teacher.plan)
  );
}

/**
 * Calcula desconto percentual entre compareAtPrice e price
 */
export function calculateDiscount(
  compareAtPrice: number | null,
  price: number
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
