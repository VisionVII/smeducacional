/**
 * AuditService.ts
 * Centraliza logging de auditoria para operações sensíveis
 *
 * Implementa o padrão de Audit Trail definido em system-blueprint.md seção 7
 * Toda alteração de status financeiro ou de acesso deve registrar um log de auditoria
 */

import { prisma } from '@/lib/db';

export enum AuditAction {
  // Usuários
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_BANNED = 'USER_BANNED',

  // Cursos
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  COURSE_DELETED = 'COURSE_DELETED',
  COURSE_PUBLISHED = 'COURSE_PUBLISHED',
  COURSE_UNPUBLISHED = 'COURSE_UNPUBLISHED',
  COURSE_PRICE_CHANGED = 'COURSE_PRICE_CHANGED',

  // Módulos e Aulas
  MODULE_DELETED = 'MODULE_DELETED',
  LESSON_DELETED = 'LESSON_DELETED',

  // Pagamentos
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  PAYOUT_GENERATED = 'PAYOUT_GENERATED',
  PAYMENT_WEBHOOK_PROCESSED = 'PAYMENT_WEBHOOK_PROCESSED',

  // Conteúdo
  CONTENT_ACCESS = 'CONTENT_ACCESS',

  // Acesso
  ROLE_PERMISSION_CHANGED = 'ROLE_PERMISSION_CHANGED',
  ADMIN_IMPERSONATION = 'ADMIN_IMPERSONATION',

  // Sistema
  SYSTEM_CONFIG_UPDATED = 'SYSTEM_CONFIG_UPDATED',
  THEME_UPDATED = 'THEME_UPDATED',
}

import { Prisma } from '@prisma/client';

interface AuditLogInput {
  userId: string;
  action: AuditAction;
  targetId?: string; // ID do recurso afetado (course, user, payment, etc)
  targetType?: string; // Tipo do recurso (Course, User, Payment, etc)
  changes?: Prisma.InputJsonValue; // Antes/depois para update
  metadata?: Prisma.InputJsonValue; // Dados adicionais
  ipAddress?: string;
}

export type AuditLogRecord = {
  id: string;
  userId: string;
  action: AuditAction;
  targetId: string | null;
  targetType: string | null;
  createdAt: Date;
  metadata?: Prisma.InputJsonValue;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
};

export async function listAuditLogs(params: {
  action?: AuditAction | null;
  userId?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<{ data: AuditLogRecord[]; total: number }> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : 20;

  const where: Prisma.AuditLogWhereInput = {
    ...(params.action ? { action: params.action } : {}),
    ...(params.userId ? { userId: params.userId } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        action: true,
        targetId: true,
        targetType: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const data: AuditLogRecord[] = rows.map((row) => ({
    ...row,
    action: row.action as AuditAction,
    metadata: row.metadata ?? undefined,
  }));

  return { data, total };
}

/**
 * Registra uma ação de auditoria
 * @param input Dados da auditoria
 * @throws Error se falhar ao registrar (não deve bloquear operação principal)
 */
export async function logAuditTrail(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        targetId: input.targetId ?? null,
        targetType: input.targetType ?? null,
        changes: input.changes ?? undefined,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Log para stdout mas NÃO lance erro (auditoria não deve quebrar operação principal)
    console.error(
      `[AuditService] Erro ao registrar auditoria ${input.action}:`,
      error
    );
  }
}

/**
 * Registra auditoria e retorna os dados para transação atômica
 * Útil para operações que devem falhar juntas
 */
export function createAuditLogData(input: AuditLogInput) {
  return {
    userId: input.userId,
    action: input.action,
    targetId: input.targetId ?? null,
    targetType: input.targetType ?? null,
    changes: input.changes ?? undefined,
    metadata: input.metadata ?? undefined,
    ipAddress: input.ipAddress ?? null,
  };
}

/**
 * Helper para extrair IP do NextRequest
 */
export function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(/, /)[0] : '127.0.0.1') || '127.0.0.1';
}

/**
 * Auditoria com transação atômica (usado quando auditoria DEVE fazer parte da operação)
 * Exemplo: Payment + Enrollment + AuditLog juntos
 */
export async function logAuditTrailWithTransaction<T>(
  input: AuditLogInput,
  operations: (
    tx: Omit<
      typeof prisma,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Registra auditoria
    await tx.auditLog.create({
      data: createAuditLogData(input),
    });

    // Executa operações
    return operations(tx);
  });
}
