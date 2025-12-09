import { NextResponse } from 'next/server';
import { getStripeClient, processStripeWebhook } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/emails';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/stripe
 * Processa webhooks do Stripe
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const stripe = getStripeClient();

    if (!signature) {
      console.error('Stripe webhook: Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook: Invalid signature', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Processar evento
    const processed = await processStripeWebhook(event);

    switch (processed.type) {
      case 'checkout_completed': {
        if (processed.session) {
          await handleCheckoutCompleted(processed.session);
        }
        break;
      }

      case 'subscription_updated': {
        if (processed.subscription) {
          await handleSubscriptionUpdated(processed.subscription);
        }
        break;
      }

      case 'subscription_cancelled': {
        if (processed.subscription) {
          await handleSubscriptionCancelled(processed.subscription);
        }
        break;
      }

      case 'invoice_paid': {
        if (processed.invoice) {
          await handleInvoicePaid(processed.invoice);
        }
        break;
      }

      case 'invoice_failed': {
        if (processed.invoice) {
          await handleInvoiceFailed(processed.invoice);
        }
        break;
      }

      default:
        console.log('Unhandled Stripe event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Trata checkout completado
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata as Record<string, string>;

  if (!metadata?.userId) {
    console.error('Missing userId in checkout session metadata');
    return;
  }

  const { userId, courseId, type } = metadata;

  if (type === 'course_purchase') {
    // Criar enrollment e payment para compra de curso
    if (!courseId) {
      console.error('Missing courseId for course purchase');
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { price: true, title: true },
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return;
    }

    // Verificar se já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    if (!existingEnrollment) {
      // Criar enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId,
          status: 'ACTIVE',
        },
      });

      // Criar payment
      await prisma.payment.create({
        data: {
          userId,
          courseId,
          stripePaymentId: session.payment_intent as string,
          checkoutSessionId: session.id,
          amount: course.price || 0,
          currency: 'BRL',
          paymentMethod: 'credit_card',
          type: 'course',
          status: 'completed',
          metadata: {
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : 'unknown',
          },
        },
      }); // Criar fatura
      const invoiceNumber = `INV-${Date.now()}`;
      await prisma.invoice.create({
        data: {
          userId,
          invoiceNumber,
          amount: course.price || 0,
          status: 'paid',
          issuedAt: new Date(),
          dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
          paidAt: new Date(),
          description: `Compra de curso`,
          paymentId: '', // Será atualizado
        },
      }); // Enviar email de confirmação
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await sendPaymentSuccessEmail({
          email: user.email,
          name: user.name || 'Estudante',
          courseTitle: course.title || 'Curso',
          amount: course.price || 0,
          invoiceNumber,
        }).catch((err) =>
          console.error('Error sending payment success email:', err)
        );
      }

      console.log(
        'Course enrollment created for user:',
        userId,
        'course:',
        courseId
      );
    }
  }

  // Atualizar status da sessão de checkout
  await prisma.checkoutSession.update({
    where: { stripeSessionId: session.id },
    data: { status: 'completed' },
  });
}

/**
 * Trata subscrição criada/atualizada
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata as Record<string, string>;

  if (!metadata?.userId || !metadata?.plan) {
    console.error('Missing userId or plan in subscription metadata');
    return;
  }

  const { userId, plan, type } = metadata;

  if (type === 'student_subscription') {
    // Atualizar ou criar subscrição de aluno
    const status = subscription.status === 'active' ? 'active' : 'inactive';

    await prisma.studentSubscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        plan,
        status,
        price: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      },
      update: {
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      },
    });

    console.log('Student subscription updated:', userId);
  } else if (type === 'teacher_subscription') {
    // Atualizar ou criar subscrição de professor
    const status = subscription.status === 'active' ? 'active' : 'inactive';

    await prisma.teacherSubscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        plan,
        status,
        price: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        startDate: new Date((subscription as any).current_period_start * 1000),
        renewDate: new Date((subscription as any).current_period_end * 1000),
      },
      update: {
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        status,
        renewDate: new Date((subscription as any).current_period_end * 1000),
      },
    });

    console.log('Teacher subscription updated:', userId);
  }
}

/**
 * Trata subscrição cancelada
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata as Record<string, string>;

  if (!metadata?.userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const { userId, type } = metadata;

  if (type === 'student_subscription') {
    await prisma.studentSubscription.update({
      where: { userId },
      data: { status: 'cancelled', cancelAt: new Date() },
    });

    console.log('Student subscription cancelled:', userId);
  } else if (type === 'teacher_subscription') {
    await prisma.teacherSubscription.update({
      where: { userId },
      data: { status: 'cancelled', cancelDate: new Date() },
    });

    console.log('Teacher subscription cancelled:', userId);
  }
}

/**
 * Trata fatura paga
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) {
    console.log('Invoice not related to subscription');
    return;
  }

  // Atualizar payment status
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: (invoice as any).payment_intent as string },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'completed' },
    });
  }

  // Atualizar invoice status
  const existingInvoice = await prisma.invoice.findFirst({
    where: { payment: { stripePaymentId: invoice.id } },
  });

  if (existingInvoice) {
    await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: { status: 'paid', paidAt: new Date() },
    });
  }

  console.log('Invoice paid:', invoice.id);
}

/**
 * Trata falha de fatura
 */
async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) {
    console.log('Invoice not related to subscription');
    return;
  }

  // Atualizar payment status
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: (invoice as any).payment_intent as string },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' },
    });
  }

  // Atualizar invoice status
  const existingInvoice = await prisma.invoice.findFirst({
    where: { payment: { stripePaymentId: invoice.id } },
  });

  if (existingInvoice) {
    await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: { status: 'overdue' },
    });

    // Enviar email de falha de pagamento
    const user = await prisma.user.findUnique({
      where: { id: existingInvoice.userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      await sendPaymentFailedEmail({
        email: user.email,
        name: user.name || 'Usuário',
        invoiceNumber: existingInvoice.invoiceNumber,
        amount: existingInvoice.amount,
        reason:
          (invoice as any).last_payment_error?.message || 'Falha desconhecida',
      }).catch((err) =>
        console.error('Error sending payment failed email:', err)
      );
    }
  }

  console.log('Invoice failed:', invoice.id);
}
