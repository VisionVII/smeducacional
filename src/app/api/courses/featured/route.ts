import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        duration: true,
        level: true,
        price: true,
        isPaid: true,
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
      orderBy: {
        featuredAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[API /courses/featured GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cursos promovidos' },
      { status: 500 }
    );
  }
}
