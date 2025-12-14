import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return NextResponse.json({
      data: { success: true },
      message: '2FA desabilitado',
    });
  } catch (error) {
    console.error('[2fa/disable]', error);
    return NextResponse.json(
      { error: 'Falha ao desabilitar 2FA' },
      { status: 500 }
    );
  }
}
