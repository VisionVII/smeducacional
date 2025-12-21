import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/activities
 * Retorna atividades recentes do sistema para dashboard admin
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Buscar atividades recentes
    // Combinando usuários criados, matrículas e cursos criados

    const [recentUsers, recentEnrollments, recentCourses] = await Promise.all([
      // Usuários recentemente criados
      prisma.user.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      }),

      // Matrículas recentes
      prisma.enrollment.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { enrolledAt: 'desc' },
        select: {
          id: true,
          enrolledAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),

      // Cursos recentemente criados
      prisma.course.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    // Formatar atividades em formato unificado
    const activities = [
      // Novos usuários
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user' as const,
        action: `Novo usuário cadastrado como ${
          user.role === 'TEACHER'
            ? 'Professor'
            : user.role === 'STUDENT'
            ? 'Aluno'
            : 'Administrador'
        }`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        createdAt: user.createdAt,
      })),

      // Novas matrículas
      ...recentEnrollments.map((enrollment) => ({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment' as const,
        action: `Matriculou-se no curso "${enrollment.course.title}"`,
        user: {
          id: enrollment.student.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          avatar: enrollment.student.avatar,
        },
        createdAt: enrollment.enrolledAt,
      })),

      // Novos cursos
      ...recentCourses.map((course) => ({
        id: `course-${course.id}`,
        type: 'course' as const,
        action: `Criou o curso "${course.title}"`,
        user: {
          id: course.instructor.id,
          name: course.instructor.name,
          email: course.instructor.email,
          avatar: course.instructor.avatar,
        },
        createdAt: course.createdAt,
      })),
    ];

    // Ordenar por data mais recente e limitar
    const sortedActivities = activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('[admin][activities] Erro ao buscar atividades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    );
  }
}
