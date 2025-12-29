import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { buildOtpauthURL, generateSecretBase32 } from '@/lib/totp';

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Gerar segredo e URL otpauth
    const secret = generateSecretBase32();
    const otpauth = buildOtpauthURL(
      secret,
      session.user.email!,
      'SMEducacional'
    );

    // Salvar segredo provisório (sem habilitar 2FA até verificar)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ data: { secret, otpauth } });
  } catch (error) {
    console.error('[2fa/setup]', error);
    return NextResponse.json({ error: 'Falha ao gerar 2FA' }, { status: 500 });
  }
}
