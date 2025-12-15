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

const themeSchema = z.object({
  palette: paletteSchema,
  layout: layoutSchema,
  animations: animationsSchema.optional(),
  themeName: z.string().nullable().optional(),
});

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
});

const contentSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImage: z.string().optional(),
  bannerText: z.string().optional(),
  bannerImage: z.string().optional(),
  sections: z.array(z.any()).optional(),
  seo: seoSchema.optional(),
  metrics: z
    .object({
      seoScore: z.number().min(0).max(100).optional(),
      aiRecommendations: z.array(z.string()).optional(),
    })
    .optional(),
});

const payloadSchema = z.object({
  theme: themeSchema.optional(),
  content: contentSchema.optional(),
});

const DEFAULT_SLUG = 'default-public-site';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const config = await prisma.publicSiteConfig.findUnique({
      where: { slug: DEFAULT_SLUG },
    });

    if (!config) {
      const created = await prisma.publicSiteConfig.create({
        data: {
          slug: DEFAULT_SLUG,
          theme: null,
          content: null,
        },
      });
      return NextResponse.json({ data: created });
    }

    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('[admin-public-site][GET]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.publicSiteConfig.upsert({
      where: { slug: DEFAULT_SLUG },
      create: {
        slug: DEFAULT_SLUG,
        theme: parsed.data.theme ?? null,
        content: parsed.data.content ?? null,
      },
      update: {
        theme: parsed.data.theme ?? null,
        content: parsed.data.content ?? null,
      },
    });

    return NextResponse.json({ data: updated, message: 'Configuração salva' });
  } catch (error) {
    console.error('[admin-public-site][PUT]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
