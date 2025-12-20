import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/teacher/[teacherId]/theme
 * Obtém o tema de um professor específico (público para alunos verem o tema do professor)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;

    if (!teacherId) {
      return NextResponse.json(
        { error: 'ID do professor é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar tema do professor
    const theme = await prisma.userTheme.findUnique({
      where: { userId: teacherId },
      select: {
        presetId: true,
        cardStyle: true,
        spacing: true,
        borderRadius: true,
      },
    });

    if (!theme) {
      // Retorna tema padrão se professor não tem tema customizado
      return NextResponse.json({
        presetId: 'academic-blue',
        cardStyle: 'FLAT',
        spacing: 'COMFORTABLE',
        borderRadius: 'MEDIUM',
      });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Erro ao buscar tema do professor:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tema do professor' },
      { status: 500 }
    );
  }
}
