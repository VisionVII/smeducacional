import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const systemConfigSchema = z.object({
  companyName: z.string().min(1).optional(),
  systemName: z.string().min(1).optional(),
  companyEmail: z.string().email().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  loginBgUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
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
