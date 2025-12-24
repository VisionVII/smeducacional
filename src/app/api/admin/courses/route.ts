import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/courses
 * Lista todos os cursos do sistema com informações detalhadas
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // DRAFT, PUBLISHED, ARCHIVED
    const category = searchParams.get('category');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      where.isPublished = status === 'PUBLISHED';
    }

    if (category) {
      where.categoryId = category;
    }

    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        categoryId: true,
        level: true,
        isPublished: true,
        isFeatured: true,
        featuredAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mapear para formato esperado pela interface
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      thumbnail: course.thumbnail,
      category: course.category,
      categoryId: course.categoryId,
      level: course.level || 'BEGINNER',
      status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
      isFeatured: course.isFeatured,
      featuredAt: course.featuredAt?.toISOString() ?? null,
      teacherName: course.instructor.name,
      teacherId: course.instructor.id,
      teacherAvatar: course.instructor.avatar,
      enrollmentCount: course._count.enrollments,
      moduleCount: course._count.modules,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('[admin][courses] Erro ao listar cursos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar cursos' },
      { status: 500 }
    );
  }
}
