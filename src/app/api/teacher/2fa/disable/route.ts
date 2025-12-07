import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import speakeasy from 'speakeasy';
import { z } from 'zod';

const disableSchema = z.object({
  token: z.string().length(6, 'Código deve ter 6 dígitos'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await req.json();
    const { token } = disableSchema.parse(body);

    // Buscar usuário com segredo 2FA
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA não está ativado' },
        { status: 400 }
      );
    }

    // Verificar token para segurança
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Desativar 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Autenticação de dois fatores desativada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Código inválido', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao desativar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar 2FA' },
      { status: 500 }
    );
  }
}
