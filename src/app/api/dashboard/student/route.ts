import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getStudentDashboardData } from '@/lib/services/dashboard.service';

const querySchema = z.object({
  courseLimit: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0
        ? Math.min(parsed, 12)
        : undefined;
    }),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
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

    const data = await getStudentDashboardData(session.user.id, {
      courseLimit: parsed.data.courseLimit,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[dashboard][student] Erro ao carregar dados', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard do aluno' },
      { status: 500 }
    );
  }
}
