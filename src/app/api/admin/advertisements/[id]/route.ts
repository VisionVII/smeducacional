import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/admin/advertisements/[id]
 * Detalhes de um anúncio específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            isPublished: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
        analytics: {
          orderBy: {
            date: 'desc',
          },
          take: 30,
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    // Calcular métricas agregadas
    const totalClicks = ad.analytics.reduce((sum, a) => sum + a.clicks, 0);
    const totalImpressions = ad.analytics.reduce(
      (sum, a) => sum + a.impressions,
      0
    );
    const totalConversions = ad.analytics.reduce(
      (sum, a) => sum + a.conversions,
      0
    );

    const ctr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return NextResponse.json({
      ...ad,
      metrics: {
        totalClicks,
        totalImpressions,
        totalConversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('[admin/advertisements/[id]] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar anúncio' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/advertisements/[id]
 * Atualiza anúncio
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const schema = z.object({
      status: z
        .enum([
          'DRAFT',
          'SCHEDULED',
          'ACTIVE',
          'PAUSED',
          'COMPLETED',
          'CANCELLED',
        ])
        .optional(),
      priority: z.number().int().min(0).max(10).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      price: z.number().min(0).optional(),
    });

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (result.data.status) updateData.status = result.data.status;
    if (result.data.priority !== undefined)
      updateData.priority = result.data.priority;
    if (result.data.startDate)
      updateData.startDate = new Date(result.data.startDate);
    if (result.data.endDate) updateData.endDate = new Date(result.data.endDate);
    if (result.data.price !== undefined) updateData.price = result.data.price;

    const ad = await prisma.advertisement.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
        teacher: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: ad,
      message: 'Anúncio atualizado com sucesso',
    });
  } catch (error) {
    console.error('[admin/advertisements/[id]] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar anúncio' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/advertisements/[id]
 * Cancela anúncio
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.advertisement.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      message: 'Anúncio cancelado com sucesso',
    });
  } catch (error) {
    console.error('[admin/advertisements/[id]] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar anúncio' },
      { status: 500 }
    );
  }
}
