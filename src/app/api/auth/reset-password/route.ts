import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RateLimitPresets } from '@/lib/rate-limit';

// Schema de validação para reset de senha
const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  code: z.string().regex(/^\d{6}$/, 'Código deve ter 6 dígitos'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
});

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
    const rateLimitResult = checkRateLimit(`reset-password:${clientIP}`, RateLimitPresets.auth);
    
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

    const body = await request.json();

    // Validação com Zod
    const validationResult = resetPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }

    const { email, code, password } = validationResult.data;

    // Buscar usuário e verificar código
    const user = await prisma.user.findUnique({
      where: { email },
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

    // Hash da nova senha com custo adequado
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atualizar senha e limpar código de recuperação
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return NextResponse.json({ 
      message: 'Senha redefinida com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
