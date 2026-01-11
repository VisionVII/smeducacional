import { prisma } from '@/lib/db';

/**
 * CourseAccessService
 * Service responsável por validar acesso e permissões de compra de cursos
 * Segue padrão VisionVII 3.0 Enterprise Governance
 */

export interface PurchaseValidationResult {
  allowed: boolean;
  reason?: string;
  errorCode?: string;
}

export const PURCHASE_ERROR_MESSAGES = {
  OWN_COURSE: 'Você não pode comprar seu próprio curso.',
  ALREADY_ENROLLED: 'Você já está matriculado neste curso.',
  COURSE_UNAVAILABLE: 'Este curso não está disponível para compra.',
  COURSE_NOT_PUBLISHED: 'Este curso ainda não foi publicado.',
  COURSE_ARCHIVED: 'Este curso foi arquivado e não está mais disponível.',
  COURSE_FREE: 'Este curso é gratuito.',
  INVALID_PRICE: 'Preço do curso inválido.',
  COURSE_NOT_FOUND: 'Curso não encontrado.',
} as const;

/**
 * Valida se um usuário pode comprar um curso
 * Aplica TODAS as regras de negócio enterprise
 */
export async function canPurchaseCourse(
  userId: string,
  courseId: string
): Promise<PurchaseValidationResult> {
  try {
    // 1. Buscar curso com instrutor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        isPublished: true,
        deletedAt: true,
        instructorId: true,
      },
    });

    if (!course) {
      return {
        allowed: false,
        reason: PURCHASE_ERROR_MESSAGES.COURSE_NOT_FOUND,
        errorCode: 'COURSE_NOT_FOUND',
      };
    }

    // 2. Validar disponibilidade do curso
    const availabilityCheck = validateCourseAvailability(course);
    if (!availabilityCheck.allowed) {
      return availabilityCheck;
    }

    // 3. ❌ RED LINE: Instrutor não pode comprar próprio curso
    if (course.instructorId === userId) {
      return {
        allowed: false,
        reason: PURCHASE_ERROR_MESSAGES.OWN_COURSE,
        errorCode: 'OWN_COURSE',
      };
    }

    // 4. Verificar se já está matriculado
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    if (enrollment) {
      return {
        allowed: false,
        reason: PURCHASE_ERROR_MESSAGES.ALREADY_ENROLLED,
        errorCode: 'ALREADY_ENROLLED',
      };
    }

    // ✅ Todas as validações passaram
    return { allowed: true };
  } catch (error) {
    console.error('[CourseAccessService] Erro ao validar compra:', error);
    return {
      allowed: false,
      reason: 'Erro ao validar permissões de compra.',
      errorCode: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Valida se um curso está disponível para compra
 * Verifica estado do curso (publicado, não arquivado, preço válido)
 */
export function validateCourseAvailability(course: {
  price: number | null;
  isPublished: boolean;
  deletedAt: Date | null;
}): PurchaseValidationResult {
  // 1. Curso não pode estar arquivado
  if (course.deletedAt) {
    return {
      allowed: false,
      reason: PURCHASE_ERROR_MESSAGES.COURSE_ARCHIVED,
      errorCode: 'COURSE_ARCHIVED',
    };
  }

  // 2. Curso deve estar publicado
  if (!course.isPublished) {
    return {
      allowed: false,
      reason: PURCHASE_ERROR_MESSAGES.COURSE_NOT_PUBLISHED,
      errorCode: 'COURSE_NOT_PUBLISHED',
    };
  }

  // 3. Curso deve ter preço válido
  if (!course.price || course.price <= 0) {
    return {
      allowed: false,
      reason: PURCHASE_ERROR_MESSAGES.COURSE_FREE,
      errorCode: 'COURSE_FREE',
    };
  }

  return { allowed: true };
}

/**
 * Verifica se um usuário é o instrutor de um curso
 */
export async function isInstructor(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    return course?.instructorId === userId;
  } catch (error) {
    console.error('[CourseAccessService] Erro ao verificar instrutor:', error);
    return false;
  }
}

/**
 * Valida múltiplos cursos para checkout (carrinho)
 */
export async function validateCartCourses(
  userId: string,
  courseIds: string[]
): Promise<{
  valid: string[];
  invalid: Array<{ courseId: string; reason: string }>;
}> {
  const valid: string[] = [];
  const invalid: Array<{ courseId: string; reason: string }> = [];

  for (const courseId of courseIds) {
    const validation = await canPurchaseCourse(userId, courseId);

    if (validation.allowed) {
      valid.push(courseId);
    } else {
      invalid.push({
        courseId,
        reason: validation.reason || 'Curso inválido',
      });
    }
  }

  return { valid, invalid };
}
