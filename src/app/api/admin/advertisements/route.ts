import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
// Prisma enums indisponíveis em TypeScript durante build sem geração; usar strings.
import { z } from 'zod';

/**
 * GET /api/admin/advertisements
 * Lista todos os anúncios com filtros
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (status) {
      where.status = status as any;
    }

    if (position) {
      where.slotPosition = position as any;
    }

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
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
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    return NextResponse.json({
      data: ads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[admin/advertisements] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao listar anúncios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/advertisements
 * Cria novo anúncio (admin pode criar para qualquer professor)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const schema = z.object({
      courseId: z.string().cuid(),
      teacherId: z.string().cuid(),
      slotPosition: z.enum([
        'HERO_BANNER',
        'SIDEBAR_TOP',
        'SIDEBAR_MIDDLE',
        'GRID_FEATURED_1',
        'GRID_FEATURED_2',
        'GRID_FEATURED_3',
      ]),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      price: z.number().min(0),
      priority: z.number().int().min(0).max(10).default(5),
    });

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, teacherId, startDate, endDate, ...data } = result.data;

    // Verificar se o curso existe e pertence ao professor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: teacherId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado ou não pertence ao professor' },
        { status: 404 }
      );
    }

    // Verificar conflitos de slot no período
    const conflictingAd = await prisma.advertisement.findFirst({
      where: {
        slotPosition: data.slotPosition,
        status: {
          in: ['SCHEDULED', 'ACTIVE'],
        },
        OR: [
          {
            startDate: {
              lte: new Date(endDate),
            },
            endDate: {
              gte: new Date(startDate),
            },
          },
        ],
      },
    });

    if (conflictingAd) {
      return NextResponse.json(
        { error: 'Slot já ocupado neste período' },
        { status: 409 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        ...data,
        courseId,
        teacherId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'SCHEDULED',
      },
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
      message: 'Anúncio criado com sucesso',
    });
  } catch (error) {
    console.error('[admin/advertisements] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar anúncio' },
      { status: 500 }
    );
  }
}
