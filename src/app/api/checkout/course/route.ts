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

    // Debug: validar dados antes de enviar ao Stripe
    console.log('[Checkout/Course] Dados para Stripe:', {
      courseId,
      courseTitle: course.title,
      coursePrice: course.price,
      userEmail: session.user.email,
      userId: session.user.id,
    });

    // Construir URL de sucesso com protocolo e host dinâmicos
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    const successUrl = new URL('/checkout/success', baseUrl);
    successUrl.searchParams.set('courseId', courseId);
    successUrl.searchParams.set('type', 'course_purchase');
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

    const cancelUrl = course.slug
      ? `${baseUrl}/courses/${course.slug}`
      : `${baseUrl}/courses`;

    // Criar sessão de checkout
    const checkoutSession = await createCourseCheckoutSession({
      userId: session.user.id,
      courseId,
      courseTitle: course.title,
      coursePrice: course.price,
      userEmail: session.user.email,
      successUrl: successUrl.toString(),
      cancelUrl,
    });

    console.log(
      '[Checkout/Course] Sessão criada com sucesso:',
      checkoutSession.id
    );

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

    console.log('[Checkout/Course] Sessão salva no banco de dados');

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Checkout/Course] Erro completo:', errorMessage);
    console.error(
      '[Checkout/Course] Stack:',
      error instanceof Error ? error.stack : 'N/A'
    );
    return NextResponse.json(
      { error: `Erro ao criar sessão de checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
}
