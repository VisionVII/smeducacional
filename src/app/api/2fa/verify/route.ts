import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyTOTP } from '@/lib/totp';

const schema = z.object({ code: z.string().min(6).max(6) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });
    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Segredo 2FA não definido' },
        { status: 400 }
      );
    }

    const ok = verifyTOTP(user.twoFactorSecret, parsed.data.code);
    if (!ok) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });
    return NextResponse.json({
      data: { success: true },
      message: '2FA habilitado',
    });
  } catch (error) {
    console.error('[2fa/verify]', error);
    return NextResponse.json(
      { error: 'Falha ao verificar 2FA' },
      { status: 500 }
    );
  }
}
