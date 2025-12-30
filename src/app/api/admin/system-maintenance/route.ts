import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  activateMaintenanceMode,
  deactivateMaintenanceMode,
  getSystemStatus,
} from '@/lib/services/system.service';

/**
 * POST /api/admin/system-maintenance
 * Ativa/desativa modo de manutenção
 *
 * Security:
 * - Auth middleware: session.user.role === 'ADMIN'
 * - Zod validation
 * - Rate limiting: 5 requisições/min
 * - Audit log
 */

const maintenanceSchema = z.object({
  maintenanceMode: z.boolean().describe('Ativar ou desativar manutenção'),
  estimatedReturnTime: z
    .string()
    .datetime()
    .describe('Quando o sistema volta (ISO 8601)'),
  maintenanceMessage: z.string().max(500).describe('Mensagem para usuários'),
});

/**
 * GET: Obtém status atual
 */
export async function GET() {
  const session = await auth();

  // 1️⃣ AUTH + RBAC
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️⃣ Get current status
  const status = await getSystemStatus();

  return NextResponse.json(status);
}

/**
 * POST: Ativa/desativa manutenção
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  // 1️⃣ AUTH + RBAC
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2️⃣ PARSE + VALIDATE
    const body = await request.json();
    const parsed = maintenanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { maintenanceMode, estimatedReturnTime, maintenanceMessage } =
      parsed.data;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 3️⃣ EXECUTE ACTION
    let result;

    if (maintenanceMode) {
      result = await activateMaintenanceMode({
        userId: session.user.id,
        estimatedReturnTime: new Date(estimatedReturnTime),
        maintenanceMessage,
        ipAddress,
      });
    } else {
      result = await deactivateMaintenanceMode({
        userId: session.user.id,
        ipAddress,
      });
    }

    // 4️⃣ RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('System maintenance error:', error);

    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
