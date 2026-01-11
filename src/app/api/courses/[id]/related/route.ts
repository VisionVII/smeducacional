import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/courses/[id]/related
 * Retorna cursos relacionados (mesma categoria, similar price range)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || '4'), 8);

    // Buscar curso original
    const course = await prisma.course.findUnique({
      where: { id, deletedAt: null },
      select: {
        categoryId: true,
        price: true,
        level: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Definir range de preço (±30%)
    const priceMin = course.price ? course.price * 0.7 : 0;
    const priceMax = course.price ? course.price * 1.3 : 100;

    // Buscar cursos relacionados
    const relatedCourses = await prisma.course.findMany({
      where: {
        id: { not: id },
        categoryId: course.categoryId,
        isPublished: true,
        deletedAt: null,
        price: {
          gte: priceMin,
          lte: priceMax,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        price: true,
        compareAtPrice: true,
        level: true,
        instructor: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      take: limit,
      orderBy: {
        enrollments: {
          _count: 'desc', // Mais populares primeiro
        },
      },
    });

    return NextResponse.json(relatedCourses);
  } catch (error) {
    console.error('[API /courses/[id]/related] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cursos relacionados' },
      { status: 500 }
    );
  }
}
