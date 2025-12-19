import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserTheme } from '@/lib/themes/get-user-theme';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const theme = await getUserTheme(session.user.id);

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('[API] Erro ao buscar tema admin:', error);
    return NextResponse.json({ error: 'Erro ao buscar tema' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Redirecionar para /api/user/theme (sistema unificado)
    return NextResponse.json(
      {
        error: 'Use /api/user/theme para atualizar temas',
        redirect: '/api/user/theme',
      },
      { status: 410 } // Gone
    );
  } catch (error) {
    console.error('[API] Erro ao salvar tema admin:', error);
    return NextResponse.json({ error: 'Erro ao salvar tema' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Redirecionar para /api/user/theme (sistema unificado)
    return NextResponse.json(
      {
        error: 'Use DELETE /api/user/theme para resetar temas',
        redirect: '/api/user/theme',
      },
      { status: 410 } // Gone
    );
  } catch (error) {
    console.error('[API] Erro ao deletar tema admin:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar tema' },
      { status: 500 }
    );
  }
}
