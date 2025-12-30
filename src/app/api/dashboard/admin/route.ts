import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/services/dashboard.service';

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0
        ? Math.min(parsed, 20)
        : undefined;
    }),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = Object.fromEntries(
      new URL(request.url).searchParams.entries()
    );
    const parsed = querySchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const data = await getAdminDashboardData();

    // Opcionalmente reduzir listas conforme limite recebido
    const limitedData = {
      ...data,
      pendingCourses: data.pendingCourses.slice(0, parsed.data.limit || 6),
      suspiciousActivities: data.suspiciousActivities.slice(
        0,
        parsed.data.limit || 10
      ),
    };

    return NextResponse.json(limitedData);
  } catch (error) {
    console.error('[dashboard][admin] Erro ao carregar dados', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard admin' },
      { status: 500 }
    );
  }
}
