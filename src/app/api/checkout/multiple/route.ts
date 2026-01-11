import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { canPurchaseCourse } from '@/lib/services/course-access.service';

// Lazy init do Stripe para evitar erro de build quando a env não está definida
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }
  return new Stripe(key);
}

const checkoutSchema = z.object({
  courseIds: z.array(z.string()).min(1, 'Pelo menos um curso é necessário'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    console.log('[Checkout/Multiple] Iniciando checkout:', {
      userId: session?.user?.id,
      hasSession: !!session?.user,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    console.log('[Checkout/Multiple] Body recebido:', {
      courseIdsCount: body.courseIds?.length,
    });

    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      console.warn(
        '[Checkout/Multiple] Validação schema falhou:',
        validation.error.errors
      );
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseIds } = validation.data;

    console.log('[Checkout/Multiple] Validando cursos:', { courseIds });

    // Buscar cursos
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        instructorId: true,
      },
    });

    console.log('[Checkout/Multiple] Cursos encontrados:', {
      total: courses.length,
      courseIds: courses.map((c) => c.id),
    });

    if (courses.length === 0) {
      console.warn(
        '[Checkout/Multiple] Nenhum curso encontrado com IDs:',
        courseIds
      );
      return NextResponse.json(
        { error: 'Nenhum curso encontrado' },
        { status: 404 }
      );
    }

    // 🛡️ VALIDAÇÃO ENTERPRISE: Verificar cada curso
    console.log('[Checkout/Multiple] Validando permissões de compra...');
    let validationErrors: { courseId: string; reason: string }[] = [];

    for (const course of courses) {
      try {
        const canPurchase = await canPurchaseCourse(session.user.id, course.id);

        if (!canPurchase.allowed) {
          console.warn('[Checkout/Multiple] Compra bloqueada:', {
            courseId: course.id,
            reason: canPurchase.errorCode,
            message: canPurchase.reason,
          });
          validationErrors.push({
            courseId: course.id,
            reason: canPurchase.reason || 'Curso indisponível para compra',
          });
        }
      } catch (validationError) {
        console.error('[Checkout/Multiple] Erro ao validar curso:', {
          courseId: course.id,
          error: validationError,
        });
        validationErrors.push({
          courseId: course.id,
          reason: 'Erro ao validar permissão de compra',
        });
      }
    }

    // Se houver erros de validação, retornar
    if (validationErrors.length > 0) {
      console.warn(
        '[Checkout/Multiple] Validação falhou para cursos:',
        validationErrors
      );
      return NextResponse.json(
        {
          error: 'Alguns cursos não estão disponíveis para compra',
          details: validationErrors,
        },
        { status: 403 }
      );
    }

    // Verificar se o usuário já está matriculado
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        courseId: { in: courseIds },
      },
      select: {
        courseId: true,
      },
    });

    const enrolledIds = new Set(existingEnrollments.map((e) => e.courseId));

    // Filtrar cursos não matriculados
    const availableCourses = courses.filter(
      (course) => !enrolledIds.has(course.id)
    );

    console.log('[Checkout/Multiple] Cursos disponíveis para compra:', {
      total: availableCourses.length,
      alreadyEnrolled: enrolledIds.size,
    });

    if (availableCourses.length === 0) {
      console.warn(
        '[Checkout/Multiple] Usuário já matriculado em todos os cursos'
      );
      return NextResponse.json(
        { error: 'Você já está matriculado em todos os cursos' },
        { status: 400 }
      );
    }

    // Criar line items para o Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      availableCourses.map((course) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: course.title,
            description: `Acesso vitalício ao curso ${course.title}`,
          },
          unit_amount: Math.round((course.price || 0) * 100),
        },
        quantity: 1,
      }));

    console.log('[Checkout/Multiple] Line items criados:', {
      count: lineItems.length,
      total:
        lineItems.reduce(
          (sum, item) =>
            sum + (item.price_data?.unit_amount || 0) * (item.quantity || 1),
          0
        ) / 100,
    });

    // Construir URLs com protocolo e host dinâmicos
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    const successUrl = new URL('/checkout/success', baseUrl);
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    successUrl.searchParams.set('multiple', 'true');

    const cancelUrl = new URL('/cart', baseUrl);

    console.log('[Checkout/Multiple] URLs configuradas:', {
      baseUrl,
      successUrl: successUrl.toString().replace('{CHECKOUT_SESSION_ID}', '***'),
      cancelUrl: cancelUrl.toString(),
    });

    // Criar sessão do Stripe
    let stripeSession;
    try {
      const stripe = getStripe();
      stripeSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email || undefined,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        metadata: {
          userId: session.user.id,
          courseIds: availableCourses.map((c) => c.id).join(','),
          type: 'multiple_courses',
        },
      });

      console.log('[Checkout/Multiple] Sessão Stripe criada com sucesso:', {
        sessionId: stripeSession.id,
        hasUrl: !!stripeSession.url,
      });
    } catch (stripeError) {
      console.error('[Checkout/Multiple] Erro ao criar sessão Stripe:', {
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

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'N/A';

    console.error('[Checkout/Multiple] ⚠️ ERRO NÃO TRATADO:', {
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
