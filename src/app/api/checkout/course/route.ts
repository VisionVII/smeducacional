import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCourseCheckoutSession } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: 'Este curso é gratuito' },
        { status: 400 }
      );
    }

    // Verificar se já está matriculado
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    });

    if (enrollment) {
      return NextResponse.json(
        { error: 'Você já está matriculado neste curso' },
        { status: 400 }
      );
    }

    // Criar sessão de checkout
    const checkoutSession = await createCourseCheckoutSession({
      userId: session.user.id,
      courseId,
      courseTitle: course.title,
      coursePrice: course.price,
      userEmail: session.user.email,
      successUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success?courseId=${courseId}`,
      cancelUrl: course.slug
        ? `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}`
        : `${process.env.NEXT_PUBLIC_URL}/courses`,
    });

    // Salvar sessão de checkout no banco
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        courseId,
        stripeSessionId: checkoutSession.id,
        url: checkoutSession.url,
        status: 'pending',
        mode: 'payment',
        amount: course.price,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
