import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Calcular progresso de cada curso
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        );

        const completedLessons = await prisma.progress.count({
          where: {
            studentId: session.user.id,
            lesson: {
              module: {
                courseId: enrollment.courseId,
              },
            },
            isCompleted: true,
          },
        });

        const progress =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          ...enrollment,
          progress: Math.round(progress),
          totalLessons,
          completedLessons,
        };
      })
    );

    return NextResponse.json(enrollmentsWithProgress);
  } catch (error) {
    console.error("Erro ao buscar matrículas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matrículas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { courseId } = await request.json();

    // Verificar se já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Você já está matriculado neste curso" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId,
        status: "ACTIVE",
      },
      include: {
        course: true,
      },
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Matrícula realizada!",
        message: `Você foi matriculado no curso ${enrollment.course.title}`,
        type: "COURSE",
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar matrícula:", error);
    return NextResponse.json(
      { error: "Erro ao criar matrícula" },
      { status: 500 }
    );
  }
}
