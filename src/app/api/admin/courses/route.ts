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
      where.published = status === 'PUBLISHED';
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        category: true,
        level: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
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
      description: course.description || '',
      thumbnail: course.thumbnail,
      category: course.category || 'Geral',
      level: course.level || 'BEGINNER',
      status: course.published ? 'PUBLISHED' : 'DRAFT',
      teacherName: course.teacher.name,
      teacherId: course.teacher.id,
      teacherAvatar: course.teacher.avatar,
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
