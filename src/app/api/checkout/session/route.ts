import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getProvider } from '@/lib/payments';
import { canPurchaseCourse } from '@/lib/services/course-access.service';

const schema = z.object({
  courseId: z.string().min(1),
  provider: z.enum(['stripe', 'stripe_pix', 'mbay']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, provider } = parsed.data;

    console.log('[Checkout/Session] Iniciando checkout:', {
      userId: session.user.id,
      courseId,
      provider,
    });

    // 🛡️ VALIDAÇÃO ENTERPRISE: Aplicar TODAS as regras de negócio
    let validation;
    try {
      validation = await canPurchaseCourse(session.user.id, courseId);
    } catch (validationError) {
      console.error('[Checkout/Session] Erro na validação:', validationError);
      return NextResponse.json(
        { error: 'Erro ao validar permissões de compra' },
        { status: 500 }
      );
    }

    if (!validation.allowed) {
      console.warn('[Checkout/Session] Compra bloqueada:', {
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
      select: { id: true, slug: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    const successUrl = `${process.env.NEXT_PUBLIC_URL}/checkout/success?courseId=${courseId}`;
    const cancelUrl = course.slug
      ? `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}`
      : `${process.env.NEXT_PUBLIC_URL}/courses`;

    const paymentProvider = getProvider(provider);

    let sessionData;
    try {
      sessionData = await paymentProvider.createSession({
        userId: session.user.id,
        courseId,
        courseTitle: course.title,
        coursePrice: course.price!,
        userEmail: session.user.email,
        successUrl,
        cancelUrl,
      });
    } catch (paymentError) {
      console.error('[Checkout/Session] Erro ao criar sessão de pagamento:', {
        provider,
        error: paymentError,
        message:
          paymentError instanceof Error ? paymentError.message : 'Unknown',
      });
      return NextResponse.json(
        {
          error:
            paymentError instanceof Error
              ? paymentError.message
              : 'Erro ao criar sessão de pagamento',
        },
        { status: 500 }
      );
    }

    // Persistir sessão
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        courseId,
        stripeSessionId: sessionData.id, // manter campo para compatibilidade
        url: sessionData.url,
        status: 'pending',
        mode: 'payment',
        amount: course.price!,
      },
    });

    return NextResponse.json({
      sessionId: sessionData.id,
      url: sessionData.url,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'N/A';

    console.error('[Checkout/Session] ⚠️ ERRO NÃO TRATADO:', {
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
