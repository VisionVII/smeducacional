import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação para paleta de cores
const paletteSchema = z.object({
  background: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  foreground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  primary: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  primaryForeground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  secondary: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  secondaryForeground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  accent: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  accentForeground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  card: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  cardForeground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  muted: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
  mutedForeground: z
    .string()
    .regex(
      /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/,
      'Formato HSL inválido'
    ),
});

// Schema de validação para layout
const layoutSchema = z.object({
  cardStyle: z.enum(['default', 'bordered', 'elevated', 'flat']),
  borderRadius: z
    .string()
    .regex(/^\d+(\.\d+)?(rem|px|em)$/, 'Formato de border radius inválido'),
  shadowIntensity: z.enum(['none', 'light', 'medium', 'strong']),
  spacing: z.enum(['compact', 'comfortable', 'spacious']),
});

// Schema de validação para animações
const animationsSchema = z.object({
  enabled: z.boolean(),
  duration: z.enum(['slow', 'normal', 'fast']),
  easing: z.enum([
    'ease-in-out',
    'ease-in',
    'ease-out',
    'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  ]),
  transitions: z.array(z.enum(['all', 'colors', 'transforms', 'opacity'])),
  hover: z.boolean(),
  focus: z.boolean(),
  pageTransitions: z.boolean(),
});

// Schema completo para PUT
const themeSchema = z.object({
  palette: paletteSchema.optional(),
  layout: layoutSchema.optional(),
  animations: animationsSchema.optional(),
  themeName: z.string().max(50).optional().nullable(),
});

// GET /api/user/theme - Obter tema do usuário autenticado (qualquer role)
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Busca o tema do usuário (independente do role)
    const userTheme = await prisma.teacherTheme.findUnique({
      where: { userId },
    });

    if (!userTheme) {
      // Retorna null se não tem tema customizado (usa padrão no frontend)
      return NextResponse.json({ theme: null });
    }

    return NextResponse.json({
      palette: userTheme.palette,
      layout: userTheme.layout,
      animations: userTheme.animations,
      themeName: userTheme.themeName,
    });
  } catch (error) {
    console.error('[GET /api/user/theme] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar tema' }, { status: 500 });
  }
}

// PUT /api/user/theme - Atualizar tema do usuário autenticado (qualquer role)
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Valida dados
    const result = themeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Upsert do tema (cria se não existe, atualiza se existe)
    const updatedTheme = await prisma.teacherTheme.upsert({
      where: { userId },
      update: {
        ...(data.palette && { palette: data.palette }),
        ...(data.layout && { layout: data.layout }),
        ...(data.animations !== undefined && { animations: data.animations }),
        ...(data.themeName !== undefined && { themeName: data.themeName }),
      },
      create: {
        userId,
        palette: data.palette || {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '222.2 47.4% 11.2%',
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
        layout: data.layout || {
          cardStyle: 'default',
          borderRadius: '0.5rem',
          shadowIntensity: 'medium',
          spacing: 'comfortable',
        },
        animations: data.animations || {
          enabled: true,
          duration: 'normal',
          easing: 'ease-in-out',
          transitions: ['all'],
          hover: true,
          focus: true,
          pageTransitions: false,
        },
        themeName: data.themeName || 'Tema Personalizado',
      },
    });

    // Limpa cache do usuário
    return NextResponse.json(
      {
        message: 'Tema atualizado com sucesso',
        theme: {
          palette: updatedTheme.palette,
          layout: updatedTheme.layout,
          animations: updatedTheme.animations,
          themeName: updatedTheme.themeName,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[PUT /api/user/theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tema' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/theme - Resetar tema do usuário para o padrão
export async function DELETE() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Deleta tema customizado (volta pro padrão)
    await prisma.teacherTheme.delete({
      where: { userId },
    });

    return NextResponse.json(
      { message: 'Tema resetado para o padrão' },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[DELETE /api/user/theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar tema' },
      { status: 500 }
    );
  }
}
