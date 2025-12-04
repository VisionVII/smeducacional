import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { checkRateLimit, getClientIP, RateLimitPresets } from '@/lib/rate-limit';

// Comparação segura de strings para prevenir timing attacks
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`verify-code:${clientIP}`, RateLimitPresets.auth);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do código (apenas 6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário e verificar código
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        resetCode: true,
        resetCodeExpires: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o código expirou
    if (new Date() > user.resetCodeExpires) {
      // Limpar código expirado
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: null,
          resetCodeExpires: null,
        },
      });
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Hash do código fornecido para comparação
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Verificar se o código está correto usando comparação segura
    if (!secureCompare(user.resetCode, hashedCode)) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Código verificado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}
