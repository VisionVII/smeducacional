import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const systemConfigSchema = z.object({
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  systemName: z.string().min(1, 'Nome do sistema é obrigatório'),
  companyEmail: z
    .string()
    .email('Email inválido')
    .or(z.literal(''))
    .nullable()
    .optional(),
  companyPhone: z.string().nullable().optional(),
  companyAddress: z.string().nullable().optional(),
  logoUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  faviconUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  loginBgUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  publicTheme: z.any().nullable().optional(), // JSON theme config (palette, layout, animations)
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  facebookUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  instagramUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  linkedinUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  twitterUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  youtubeUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal(''))
    .nullable()
    .optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
});

// GET - Obter configurações do sistema
export async function GET() {
  try {
    // Buscar configuração (sempre key="system")
    let config = await prisma.systemConfig.findUnique({
      where: { key: 'system' },
    });

    // Se não existir, criar com valores padrão
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          key: 'system',
          companyName: 'SM Educacional',
          systemName: 'SM Educacional',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('[GET /api/admin/system-config] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações (apenas ADMIN)
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = systemConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Atualizar ou criar configuração
    const config = await prisma.systemConfig.upsert({
      where: { key: 'system' },
      update: validation.data,
      create: {
        key: 'system',
        ...validation.data,
      },
    });

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      config,
    });
  } catch (error) {
    console.error('[PUT /api/admin/system-config] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
