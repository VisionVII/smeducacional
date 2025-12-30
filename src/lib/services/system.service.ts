import { prisma } from '@/lib/db';
import { logAuditTrail, AuditAction } from '@/lib/audit.service';
import { sendEmail } from '@/lib/email.service';
import { revalidatePath } from 'next/cache';

/**
 * SystemService
 * Gerencia estado do sistema (modo manutenção, saúde, etc)
 * VisionVII 3.0 Enterprise Pattern
 */

// Cache em memória para modo de manutenção (5 segundos TTL)
let maintenanceCache: {
  data: { maintenanceMode: boolean } | null;
  expires: number;
} = {
  data: null,
  expires: 0,
};

// Rate limiting em memória (aceitável para admin routes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Verifica se sistema está em modo de manutenção
 * Usa cache curto para sincronização entre edge functions
 */
export async function isMaintenanceActive(): Promise<boolean> {
  const now = Date.now();

  // Se cache ainda válido, retorna cache
  if (maintenanceCache.expires > now && maintenanceCache.data) {
    return maintenanceCache.data.maintenanceMode;
  }

  // Senão, consulta banco de dados (fresh)
  const status = await prisma.systemStatus.findFirst({
    select: { maintenanceMode: true },
  });

  // Atualiza cache com 5 segundos de TTL
  maintenanceCache = {
    data: status,
    expires: now + 5000,
  };

  return status?.maintenanceMode ?? false;
}

/**
 * Obtém status completo do sistema
 */
export async function getSystemStatus() {
  return prisma.systemStatus.findFirst({
    select: {
      id: true,
      maintenanceMode: true,
      estimatedReturnTime: true,
      maintenanceMessage: true,
      activatedBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Ativa modo de manutenção
 * Requer:
 * - session.user.role === 'ADMIN'
 * - Rate limit: 5 requisições/minuto
 */
export async function activateMaintenanceMode(input: {
  userId: string;
  estimatedReturnTime: Date;
  maintenanceMessage: string;
  ipAddress: string;
}) {
  // Validação de rate limit
  if (!checkRateLimit(input.userId)) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // 1. Atualiza banco de dados
  const updated = await prisma.systemStatus.upsert({
    where: { id: 'singleton' },
    update: {
      maintenanceMode: true,
      estimatedReturnTime: input.estimatedReturnTime,
      maintenanceMessage: input.maintenanceMessage,
      activatedBy: input.userId,
      updatedAt: new Date(),
    },
    create: {
      id: 'singleton',
      maintenanceMode: true,
      estimatedReturnTime: input.estimatedReturnTime,
      maintenanceMessage: input.maintenanceMessage,
      activatedBy: input.userId,
    },
  });

  // 2. Invalida cache local imediatamente
  maintenanceCache = { data: updated, expires: 0 };

  // 3. Revalida paths em Vercel (ISR)
  revalidatePath('/', 'layout');
  revalidatePath('/maintenance', 'page');

  // 4. Log de auditoria
  await logAuditTrail({
    userId: input.userId,
    action: AuditAction.SYSTEM_CONFIG_UPDATED,
    targetType: 'SystemStatus',
    targetId: 'singleton',
    metadata: {
      maintenanceMode: true,
      estimatedReturnTime: input.estimatedReturnTime.toISOString(),
      message: input.maintenanceMessage,
      ipAddress: input.ipAddress,
    },
  });

  // 5. Cache já invalidado no passo 2
  revalidatePath('/admin/system/maintenance');

  return updated;
}

/**
 * Desativa modo de manutenção (retorna do sistema)
 */
export async function deactivateMaintenanceMode(input: {
  userId: string;
  ipAddress: string;
}) {
  // Validação de rate limit
  if (!checkRateLimit(input.userId)) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // 1. Atualiza banco de dados
  const updated = await prisma.systemStatus.update({
    where: { id: 'singleton' },
    data: {
      maintenanceMode: false,
      updatedAt: new Date(),
    },
  });

  // 2. Invalida cache
  maintenanceCache = { data: updated, expires: 0 };

  // 3. Revalida paths
  revalidatePath('/', 'layout');
  revalidatePath('/maintenance', 'page');

  // 4. Log de auditoria
  await logAuditTrail({
    userId: input.userId,
    action: AuditAction.SYSTEM_CONFIG_UPDATED,
    targetType: 'SystemStatus',
    targetId: 'singleton',
    metadata: {
      maintenanceMode: false,
      ipAddress: input.ipAddress,
    },
  });

  // 5. Revalida paths de UI
  revalidatePath('/admin/system/maintenance');
  revalidatePath('/api/system/maintenance-stream');

  // 6. Envia email para todos os admins (opcional, nice-to-have)
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true },
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: '✅ Sistema voltou do modo de manutenção',
        html: `<p>Olá, ${
          admin.name || 'Admin'
        }!</p><p>O sistema saiu do modo de manutenção e está disponível novamente.</p>`,
      });
    }
  } catch (err) {
    console.error('Failed to send maintenance end emails:', err);
  }

  return updated;
}

/**
 * Rate limiting: máx 5 requisições por minuto por usuário
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(userId);

  // Se não existe ou resetou, cria novo
  if (!current || now >= current.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  // Incrementa contador
  current.count++;

  // Se excedeu limite, rejeita
  if (current.count > 5) {
    current.count--;
    return false;
  }

  return true;
}

/**
 * Inicializa SystemStatus se não existir
 * Chamado no boot da aplicação
 */
export async function initializeSystemStatus() {
  const exists = await prisma.systemStatus.findFirst();

  if (!exists) {
    await prisma.systemStatus.create({
      data: {
        id: 'singleton',
        maintenanceMode: false,
        estimatedReturnTime: new Date(),
        maintenanceMessage: '',
        activatedBy: 'system',
      },
    });
  }
}
