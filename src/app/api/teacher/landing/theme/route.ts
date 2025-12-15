import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const paletteSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  card: z.string(),
  cardForeground: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
});

const layoutSchema = z.object({
  cardStyle: z.enum(['default', 'bordered', 'elevated', 'flat']),
  borderRadius: z.string(),
  shadowIntensity: z.enum(['none', 'light', 'medium', 'strong']),
  spacing: z.enum(['compact', 'comfortable', 'spacious']),
});

const animationsSchema = z
  .object({
    enabled: z.boolean().optional(),
    duration: z.enum(['slow', 'normal', 'fast']).optional(),
    easing: z
      .enum([
        'ease-in-out',
        'ease-in',
        'ease-out',
        'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      ])
      .optional(),
    transitions: z
      .array(z.enum(['all', 'colors', 'transforms', 'opacity']))
      .optional(),
    hover: z.boolean().optional(),
    focus: z.boolean().optional(),
    pageTransitions: z.boolean().optional(),
  })
  .optional();

const landingThemeSchema = z.object({
  palette: paletteSchema,
  layout: layoutSchema,
  animations: animationsSchema.optional(),
  themeName: z.string().nullable().optional(),
});

// Schema para updates parciais (permite qualquer combinação de campos)
const partialThemeSchema = z
  .object({
    palette: paletteSchema.optional(),
    layout: layoutSchema.optional(),
    animations: animationsSchema.optional(),
    themeName: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.palette ||
      data.layout ||
      data.animations ||
      data.themeName !== undefined,
    { message: 'Pelo menos um campo deve ser fornecido' }
  );

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { landingTheme: true },
    });

    return NextResponse.json({ theme: user?.landingTheme ?? null });
  } catch (error) {
    console.error('[landing-theme][GET]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = partialThemeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Buscar tema atual para fazer merge
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { landingTheme: true },
    });

    const currentTheme = currentUser?.landingTheme as any;

    // Merge do tema atual com as atualizações
    const mergedTheme = {
      palette: parsed.data.palette ?? currentTheme?.palette,
      layout: parsed.data.layout ?? currentTheme?.layout,
      animations: parsed.data.animations ?? currentTheme?.animations,
      themeName:
        parsed.data.themeName !== undefined
          ? parsed.data.themeName
          : currentTheme?.themeName,
    };

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { landingTheme: mergedTheme },
      select: { landingTheme: true },
    });

    return NextResponse.json({
      theme: updated.landingTheme,
      message: 'Tema da landing salvo',
    });
  } catch (error) {
    console.error('[landing-theme][PUT]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        landingTheme: undefined,
      },
    });

    return NextResponse.json({ message: 'Tema da landing removido' });
  } catch (error) {
    console.error('[landing-theme][DELETE]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
