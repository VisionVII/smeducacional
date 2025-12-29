import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/admin/plans
 * Retorna configurações de planos e mensalidades
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const config = await prisma.systemConfig.findFirst({
      select: {
        freePlanCommission: true,
        basicPlanPrice: true,
        proPlanPrice: true,
        premiumPlanPrice: true,
        adSlotPrice: true,
        adSlotsAvailable: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        {
          freePlanCommission: 0.15,
          basicPlanPrice: 9900,
          proPlanPrice: 19900,
          premiumPlanPrice: 39900,
          adSlotPrice: 19900,
          adSlotsAvailable: 6,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('[admin/plans] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/plans
 * Atualiza configurações de planos e mensalidades
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const schema = z.object({
      freePlanCommission: z.number().min(0).max(1).optional(),
      basicPlanPrice: z.number().min(0).optional(),
      proPlanPrice: z.number().min(0).optional(),
      premiumPlanPrice: z.number().min(0).optional(),
      adSlotPrice: z.number().min(0).optional(),
      adSlotsAvailable: z.number().int().min(1).max(20).optional(),
    });

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const config = await prisma.systemConfig.upsert({
      where: { key: 'system' },
      create: {
        key: 'system',
        ...result.data,
      },
      update: result.data,
      select: {
        freePlanCommission: true,
        basicPlanPrice: true,
        proPlanPrice: true,
        premiumPlanPrice: true,
        adSlotPrice: true,
        adSlotsAvailable: true,
      },
    });

    return NextResponse.json({
      data: config,
      message: 'Configurações atualizadas com sucesso',
    });
  } catch (error) {
    console.error('[admin/plans] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
