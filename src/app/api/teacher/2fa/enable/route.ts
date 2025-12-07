import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Gerar segredo para 2FA
    const secret = speakeasy.generateSecret({
      name: `SM Educacional (${session.user.email})`,
      issuer: 'SM Educacional',
    });

    if (!secret.otpauth_url) {
      return NextResponse.json(
        { error: 'Erro ao gerar segredo 2FA' },
        { status: 500 }
      );
    }

    // Gerar QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Salvar segredo temporário (só será ativado após verificação)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false, // Ainda não ativado
      },
    });

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      message: 'Escaneie o QR Code com seu aplicativo autenticador',
    });
  } catch (error) {
    console.error('Erro ao gerar 2FA:', error);
    return NextResponse.json({ error: 'Erro ao gerar 2FA' }, { status: 500 });
  }
}
