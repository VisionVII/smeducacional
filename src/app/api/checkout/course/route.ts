import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCourseCheckoutSession } from '@/lib/stripe';
import { canPurchaseCourse } from '@/lib/services/course-access.service';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    console.log('[Checkout/Course] Iniciando checkout:', {
      userId: session.user.id,
      courseId,
    });

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId é obrigatório' },
        { status: 400 }
      );
    }

    // 🛡️ VALIDAÇÃO ENTERPRISE: Aplicar TODAS as regras de negócio
    let validation;
    try {
      validation = await canPurchaseCourse(session.user.id, courseId);
    } catch (validationError) {
      console.error('[Checkout/Course] Erro na validação:', validationError);
      return NextResponse.json(
        { error: 'Erro ao validar permissões de compra' },
        { status: 500 }
      );
    }

    if (!validation.allowed) {
      console.warn('[Checkout/Course] Compra bloqueada:', {
        userId: session.user.id,
        courseId,
        reason: validation.errorCode,
        message: validation.reason,
      });

      return NextResponse.json({ error: validation.reason }, { status: 403 });
    }

    // Buscar dados do curso para checkout (já validado acima)
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
    let checkoutSession;
    try {
      checkoutSession = await createCourseCheckoutSession({
        userId: session.user.id,
        courseId,
        courseTitle: course.title,
        coursePrice: course.price || 0,
        userEmail: session.user.email,
        successUrl: successUrl.toString(),
        cancelUrl,
      });
    } catch (stripeError) {
      console.error('[Checkout/Course] Erro ao criar sessão Stripe:', {
        error: stripeError,
        message: stripeError instanceof Error ? stripeError.message : 'Unknown',
      });
      return NextResponse.json(
        {
          error:
            stripeError instanceof Error
              ? stripeError.message
              : 'Erro ao criar sessão de pagamento',
        },
        { status: 500 }
      );
    }

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
    const errorStack = error instanceof Error ? error.stack : 'N/A';

    console.error('[Checkout/Course] ⚠️ ERRO NÃO TRATADO:', {
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error,
      error,
    });

    return NextResponse.json(
      {
        error: errorMessage || 'Erro ao processar checkout',
        debug:
          process.env.NODE_ENV === 'development'
            ? { message: errorMessage, stack: errorStack }
            : undefined,
      },
      { status: 500 }
    );
  }
}
