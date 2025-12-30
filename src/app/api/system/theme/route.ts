import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getUserTheme, createDefaultTheme } from '@/lib/themes/get-user-theme';
import { z } from 'zod';

const updateThemeSchema = z.object({
  presetId: z.enum([
    'academic-blue',
    'forest-green',
    'sunset-orange',
    'royal-purple',
    'ocean-teal',
    'crimson-red',
  ]),
  cardStyle: z.enum(['FLAT', 'ELEVATED', 'BORDERED', 'GLASS']).optional(),
  cardShadow: z.enum(['NONE', 'LIGHT', 'MEDIUM', 'STRONG', 'XL']).optional(),
  cardBorder: z.boolean().optional(),
  card3D: z.boolean().optional(),
  cardGlass: z.boolean().optional(),
  spacing: z
    .enum(['COMPACT', 'COMFORTABLE', 'SPACIOUS', 'EXTRA_SPACIOUS'])
    .optional(),
  borderRadius: z
    .enum(['NONE', 'SMALL', 'MEDIUM', 'LARGE', 'XL', 'FULL'])
    .optional(),
  animationsEnabled: z.boolean().optional(),
  animationSpeed: z
    .enum(['DISABLED', 'FAST', 'NORMAL', 'SLOW', 'VERY_SLOW'])
    .optional(),
  hoverEffects: z.boolean().optional(),
  fontSize: z.enum(['SMALL', 'NORMAL', 'LARGE', 'EXTRA_LARGE']).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const theme = await getUserTheme(session.user.id);

    return NextResponse.json({ data: theme, message: 'Tema carregado' });
  } catch (error) {
    console.error('[GET /api/system/theme] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar tema' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.userTheme.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        presetId: data.presetId,
        cardStyle: data.cardStyle || 'FLAT',
        cardShadow: data.cardShadow || 'NONE',
        cardBorder: data.cardBorder ?? true,
        card3D: data.card3D ?? false,
        cardGlass: data.cardGlass ?? false,
        spacing: data.spacing || 'COMFORTABLE',
        borderRadius: data.borderRadius || 'MEDIUM',
        animationsEnabled: data.animationsEnabled ?? true,
        animationSpeed: data.animationSpeed || 'NORMAL',
        hoverEffects: data.hoverEffects ?? true,
        fontSize: data.fontSize || 'NORMAL',
      },
      update: {
        presetId: data.presetId,
        cardStyle: data.cardStyle || 'FLAT',
        cardShadow: data.cardShadow || 'NONE',
        cardBorder: data.cardBorder ?? true,
        card3D: data.card3D ?? false,
        cardGlass: data.cardGlass ?? false,
        spacing: data.spacing || 'COMFORTABLE',
        borderRadius: data.borderRadius || 'MEDIUM',
        animationsEnabled: data.animationsEnabled ?? true,
        animationSpeed: data.animationSpeed || 'NORMAL',
        hoverEffects: data.hoverEffects ?? true,
        fontSize: data.fontSize || 'NORMAL',
        updatedAt: new Date(),
      },
    });

    const theme = await getUserTheme(session.user.id);

    return NextResponse.json({ data: theme, message: 'Tema atualizado' });
  } catch (error) {
    console.error('[PUT /api/system/theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tema' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await prisma.userTheme.delete({ where: { userId: session.user.id } });
    const theme = await createDefaultTheme(session.user.id);

    return NextResponse.json({ data: theme, message: 'Tema resetado' });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      const session = await auth();
      if (session?.user?.id) {
        const theme = await createDefaultTheme(session.user.id);
        return NextResponse.json({
          data: theme,
          message: 'Tema padrão aplicado',
        });
      }
    }

    console.error('[DELETE /api/system/theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar tema' },
      { status: 500 }
    );
  }
}
