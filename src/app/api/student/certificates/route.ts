import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            duration: true, // em minutos
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    // Buscar enrollments para pegar completedAt
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        courseId: {
          in: certificates.map((c) => c.courseId),
        },
      },
      select: {
        courseId: true,
        completedAt: true,
      },
    });

    // Criar mapa de enrollments para acesso rápido
    const enrollmentMap = new Map(
      enrollments.map((e) => [e.courseId, e.completedAt])
    );

    // Mapear para o formato esperado pelo frontend
    const mapped = certificates.map((cert) => ({
      id: cert.id,
      courseTitle: cert.course.title,
      issuedAt: cert.issuedAt,
      completionDate: enrollmentMap.get(cert.courseId) || cert.issuedAt,
      courseHours: cert.course.duration
        ? Math.round(cert.course.duration / 60)
        : 0, // converter minutos para horas
      certificateUrl: `/verify-certificate/${cert.certificateNumber}`,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar certificados' },
      { status: 500 }
    );
  }
}
