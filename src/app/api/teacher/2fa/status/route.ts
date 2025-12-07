import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false,
    });
  } catch (error) {
    console.error('Erro ao buscar status 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status 2FA' },
      { status: 500 }
    );
  }
}
