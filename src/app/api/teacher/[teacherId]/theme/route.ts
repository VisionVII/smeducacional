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
        palette: true,
        layout: true,
        animations: true,
        themeName: true,
      },
    });

    if (!theme) {
      // Retorna tema padrão se professor não tem tema customizado
      return NextResponse.json({
        palette: {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '221.2 83.2% 53.3%',
          primaryForeground: '210 40% 98%',
          secondary: '210 40% 96.1%',
          secondaryForeground: '222.2 47.4% 11.2%',
          accent: '210 40% 96.1%',
          accentForeground: '222.2 47.4% 11.2%',
          card: '0 0% 100%',
          cardForeground: '240 10% 3.9%',
          muted: '210 40% 96.1%',
          mutedForeground: '215.4 16.3% 46.9%',
        },
        layout: {
          cardStyle: 'default',
          borderRadius: '0.5rem',
          shadowIntensity: 'medium',
          spacing: 'comfortable',
        },
        themeName: 'Sistema Padrão',
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
