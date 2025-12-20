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

// Schema de validação para PUT
const themeSchema = z.object({
  palette: paletteSchema.optional(),
  layout: layoutSchema.optional(),
  themeName: z.string().max(50).optional(),
});

// GET /api/teacher/theme - Obter tema atual do professor
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas professores podem acessar temas.' },
        { status: 403 }
      );
    }

    const theme = await prisma.userTheme.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        palette: true,
        layout: true,
        themeName: true,
        updatedAt: true,
      },
    });

    if (!theme) {
      // Retorna tema padrão se não existir
      return NextResponse.json({
        palette: {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '221.2 83.2% 53.3%',
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
        layout: {
          cardStyle: 'default',
          borderRadius: '0.5rem',
          shadowIntensity: 'medium',
          spacing: 'comfortable',
        },
        themeName: null,
      });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Erro ao buscar tema:', error);
    return NextResponse.json({ error: 'Erro ao buscar tema' }, { status: 500 });
  }
}

// PUT /api/teacher/theme - Atualizar tema do professor
export async function PUT(request: Request) {
  try {
    const session = await auth();
    console.log('[PUT /api/teacher/theme] Session:', session);

    if (!session?.user?.id) {
      console.error('[PUT /api/teacher/theme] Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      console.error(
        '[PUT /api/teacher/theme] Acesso negado - role:',
        session.user.role
      );
      return NextResponse.json(
        { error: 'Acesso negado. Apenas professores podem atualizar temas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log(
      '[PUT /api/teacher/theme] Body recebido:',
      JSON.stringify(body).substring(0, 100)
    );

    // Validar dados
    const validatedData = themeSchema.parse(body);

    // Verificar tamanho do payload (limite de 10KB)
    const payloadSize = JSON.stringify(validatedData).length;
    if (payloadSize > 10240) {
      return NextResponse.json(
        { error: 'Payload muito grande. Máximo 10KB permitido.' },
        { status: 413 }
      );
    }

    console.log('[PUT /api/teacher/theme] userId:', session.user.id);
    console.log('[PUT /api/teacher/theme] Atualizando tema...');

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error(
        '[PUT /api/teacher/theme] Usuário não encontrado:',
        session.user.id
      );
      return NextResponse.json(
        { error: 'Usuário não encontrado. Tente fazer login novamente.' },
        { status: 404 }
      );
    }

    // Atualizar ou criar tema
    const theme = await prisma.userTheme.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        palette: validatedData.palette || {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '221.2 83.2% 53.3%',
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
        layout: validatedData.layout || {
          cardStyle: 'default',
          borderRadius: '0.5rem',
          shadowIntensity: 'medium',
          spacing: 'comfortable',
        },
        themeName: validatedData.themeName,
      },
      update: {
        ...(validatedData.palette && { palette: validatedData.palette }),
        ...(validatedData.layout && { layout: validatedData.layout }),
        ...(validatedData.themeName !== undefined && {
          themeName: validatedData.themeName,
        }),
      },
      select: {
        id: true,
        palette: true,
        layout: true,
        themeName: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.error('[PUT /api/teacher/theme] Erro capturado:', error);

    if (error instanceof z.ZodError) {
      console.error('[PUT /api/teacher/theme] Validation Error:', error.errors);
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    // Erro de chave estrangeira ou constraint
    const errorStr = String(error);
    console.error('[PUT /api/teacher/theme] Error string:', errorStr);

    if (
      errorStr.includes('Foreign key constraint') ||
      errorStr.includes('fkey') ||
      errorStr.includes('P2003')
    ) {
      console.error('[PUT /api/teacher/theme] Foreign key error detectado');
      // Se chegou aqui, significa que o usuário foi deletado após a verificação
      return NextResponse.json(
        {
          error: 'Usuário não encontrado. Por favor, faça login novamente.',
          details: 'Sua sessão pode estar inválida',
        },
        { status: 401 }
      );
    }

    console.error('[PUT /api/teacher/theme] Error genérico:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar tema',
        details: errorStr.substring(0, 200),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/theme - Resetar tema para o padrão
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas professores podem resetar temas.' },
        { status: 403 }
      );
    }

    // Deletar tema customizado (volta ao padrão)
    await prisma.userTheme.deleteMany({
      where: { userId: session.user.id },
    });

    // Retornar tema padrão
    const defaultTheme = {
      palette: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        primary: '221.2 83.2% 53.3%',
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
      layout: {
        cardStyle: 'default',
        borderRadius: '0.5rem',
        shadowIntensity: 'medium',
        spacing: 'comfortable',
      },
      themeName: 'Sistema Padrão',
    };

    return NextResponse.json(defaultTheme);
  } catch (error) {
    console.error('Erro ao resetar tema:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar tema' },
      { status: 500 }
    );
  }
}
