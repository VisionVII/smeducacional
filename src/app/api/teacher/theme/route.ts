import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/teacher/theme
 * Rota legada - Sistema de temas foi migrado para admin settings (Theme V2.0)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar tema do usuário (herda do admin agora)
    const theme = await prisma.userTheme.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        presetId: true,
        cardStyle: true,
        spacing: true,
        borderRadius: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      theme || {
        presetId: 'academic-blue',
        cardStyle: 'FLAT',
        spacing: 'COMFORTABLE',
        borderRadius: 'MEDIUM',
      }
    );
  } catch (error) {
    console.error('Erro ao buscar tema:', error);
    return NextResponse.json({ error: 'Erro ao buscar tema' }, { status: 500 });
  }
}

/**
 * PUT /api/teacher/theme
 * Rota legada - Sistema de temas foi migrado para admin settings (Theme V2.0)
 * Retorna mensagem informando a migração
 */
export async function PUT() {
  return NextResponse.json(
    {
      error:
        'Sistema de temas migrado. Configure em Admin > Configurações > Tema',
      migrated: true,
      redirectTo: '/admin/settings',
    },
    { status: 410 } // 410 Gone - recurso foi removido permanentemente
  );
}

/**
 * DELETE /api/teacher/theme
 * Rota legada - Sistema de temas foi migrado para admin settings (Theme V2.0)
 * Retorna mensagem informando a migração
 */
export async function DELETE() {
  return NextResponse.json(
    {
      error:
        'Sistema de temas migrado. Configure em Admin > Configurações > Tema',
      migrated: true,
      redirectTo: '/admin/settings',
    },
    { status: 410 } // 410 Gone - recurso foi removido permanentemente
  );
}
