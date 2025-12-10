import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    const where: any = {};

    if (session.user.role === 'STUDENT') {
      // Buscar apenas atividades dos cursos matriculados
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: { courseId: true },
      });

      // Como Activity não tem courseId direto, vamos buscar por moduleId
      if (moduleId) {
        where.moduleId = moduleId;
      }
    } else {
      if (moduleId) {
        where.moduleId = moduleId;
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        submissions:
          session.user.role === 'STUDENT'
            ? {
                where: {
                  studentId: session.user.id,
                },
              }
            : true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        moduleId: data.moduleId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxScore: data.maxScore || 100,
        createdById: session.user.id,
      },
    });

    // Buscar o módulo para pegar o curso
    const courseModule = await prisma.module.findUnique({
      where: { id: data.moduleId },
      include: {
        course: true,
      },
    });

    if (courseModule) {
      // Notificar alunos matriculados
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: courseModule.courseId,
          status: 'ACTIVE',
        },
      });

      await Promise.all(
        enrollments.map((enrollment) =>
          prisma.notification.create({
            data: {
              userId: enrollment.studentId,
              title: 'Nova atividade disponível!',
              message: `Uma nova atividade foi adicionada ao curso ${courseModule.course.title}`,
              type: 'ACTIVITY',
            },
          })
        )
      );
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao criar atividade' },
      { status: 500 }
    );
  }
}
