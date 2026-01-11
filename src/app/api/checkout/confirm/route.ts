import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';
import { NotificationType } from '@prisma/client';
import { z } from 'zod';

const confirmSchema = z.object({
  sessionId: z.string().min(1, 'sessionId é obrigatório'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    const body = await request.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Sessão não encontrada no Stripe' },
        { status: 404 }
      );
    }

    const metadata = checkoutSession.metadata as Record<string, string> | null;
    const userIdFromMetadata = metadata?.userId;
    const courseId = metadata?.courseId;
    const type = metadata?.type;

    if (!userIdFromMetadata || !courseId || type !== 'course_purchase') {
      return NextResponse.json(
        { error: 'Metadados inválidos para confirmação de checkout' },
        { status: 400 }
      );
    }

    if (session?.user && userIdFromMetadata !== session.user.id) {
      return NextResponse.json(
        { error: 'Sessão não pertence ao usuário autenticado' },
        { status: 403 }
      );
    }

    if (
      checkoutSession.payment_status !== 'paid' &&
      checkoutSession.status !== 'complete'
    ) {
      return NextResponse.json(
        { error: 'Pagamento ainda não confirmado' },
        { status: 400 }
      );
    }

    const isTest = checkoutSession.livemode === false;
    const stripePaymentId =
      typeof checkoutSession.payment_intent === 'string'
        ? checkoutSession.payment_intent
        : undefined;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    let paymentCreated = false;
    let enrollmentCreated = false;

    await prisma.$transaction(async (tx) => {
      // Upsert CheckoutSession e capturar o ID retornado
      const upsertedCheckoutSession = await tx.checkoutSession.upsert({
        where: { stripeSessionId: sessionId },
        update: {
          status: 'completed',
          amount: course.price,
          currency: 'BRL',
          userId: userIdFromMetadata,
          courseId,
          metadata: checkoutSession.metadata ?? {},
        },
        create: {
          userId: userIdFromMetadata,
          courseId,
          stripeSessionId: sessionId,
          paymentIntentId: stripePaymentId,
          mode: checkoutSession.mode || 'payment',
          status: 'completed',
          amount: course.price,
          currency: 'BRL',
          url: checkoutSession.url ?? undefined,
          metadata: checkoutSession.metadata ?? {},
        },
        select: { id: true }, // Retornar o ID do CheckoutSession
      });

      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userIdFromMetadata,
            courseId,
          },
        },
      });

      if (!existingEnrollment) {
        await tx.enrollment.create({
          data: {
            studentId: userIdFromMetadata,
            courseId,
            status: 'ACTIVE',
          },
        });
        enrollmentCreated = true;
      }

      if (stripePaymentId) {
        const existingPayment = await tx.payment.findUnique({
          where: { stripePaymentId },
        });

        if (!existingPayment) {
          await tx.payment.create({
            data: {
              userId: userIdFromMetadata,
              courseId,
              stripePaymentId,
              checkoutSessionId: upsertedCheckoutSession.id, // Usar o UUID, não o stripeSessionId
              amount: course.price || 0,
              currency: 'BRL',
              paymentMethod: 'credit_card',
              type: 'course',
              status: 'COMPLETED',
              isTest,
              metadata: {
                livemode: checkoutSession.livemode,
                paymentStatus: checkoutSession.payment_status,
              },
            },
          });
          paymentCreated = true;
        } else if (existingPayment.status !== 'COMPLETED') {
          await tx.payment.update({
            where: { stripePaymentId },
            data: {
              status: 'COMPLETED',
              isTest,
              checkoutSessionId: upsertedCheckoutSession.id, // Usar o UUID, não o stripeSessionId
            },
          });
        }
      }
    });

    if (paymentCreated) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const messageAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(course.price || 0);

      const buyerName = session?.user?.name || 'Usuário';

      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              title: isTest
                ? '💳 Pagamento de Teste Recebido'
                : '💰 Novo Pagamento Confirmado',
              message: `${buyerName} comprou o curso "${
                course.title
              }" por ${messageAmount}${isTest ? ' (AMBIENTE DE TESTE)' : ''}`,
              type: NotificationType.PAYMENT_RECEIPT,
              isRead: false,
            },
          })
        )
      );
    }

    return NextResponse.json({
      data: {
        status: 'ok',
        enrollmentCreated,
        paymentCreated,
        isTest,
        courseId,
      },
      message: 'Checkout confirmado com sucesso',
    });
  } catch (error) {
    console.error('[api/checkout/confirm] Erro detalhado:', error);

    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('[api/checkout/confirm] Message:', error.message);
      console.error('[api/checkout/confirm] Stack:', error.stack);
    }

    // Retornar mensagem de erro mais específica em dev
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage =
      isDev && error instanceof Error
        ? `Erro ao confirmar checkout: ${error.message}`
        : 'Erro ao confirmar checkout';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
