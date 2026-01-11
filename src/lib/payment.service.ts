/**
 * PaymentService.ts
 * Abstrai toda a lógica de pagamento (Stripe, inscrições, reembolsos)
 *
 * Implementa o padrão Service definido em system-blueprint.md seção 1 e 7
 * Se mudarmos de Stripe para outro gateway, mudamos apenas este arquivo
 *
 * Métodos principais:
 * - createSubscription (student/teacher)
 * - cancelSubscription
 * - handleWebhook (Stripe signature verification)
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { logAuditTrail, AuditAction } from '@/lib/audit.service';
import { sendWelcomeEmail } from '@/lib/email.service';
import type { Prisma } from '@prisma/client';

const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe secret key not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-11-17.clover',
  });
};

interface CreateSubscriptionInput {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CreateCourseCheckoutInput {
  userId: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  instructorId?: string;
}

/**
 * Cria sessão de checkout para compra de curso
 */
export async function createCourseCheckoutSession(
  input: CreateCourseCheckoutInput
): Promise<Stripe.Checkout.Session> {
  if (!input.userEmail?.trim()) {
    throw new Error('Email do usuário é obrigatório');
  }

  const unitAmount = Math.round(input.coursePrice * 100);
  if (unitAmount <= 0) {
    throw new Error(
      `Preço inválido: ${input.coursePrice} (unit_amount: ${unitAmount})`
    );
  }

  console.log('[PaymentService] Criando checkout de curso:', {
    courseTitle: input.courseTitle,
    coursePrice: input.coursePrice,
    unitAmount,
  });

  try {
    let instructorId = input.instructorId;
    if (!instructorId) {
      const courseOwner = await prisma.course.findUnique({
        where: { id: input.courseId },
        select: { instructorId: true },
      });
      instructorId = courseOwner?.instructorId;
    }

    const stripe = getStripeClient();

    // Build session params dynamically
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: input.courseTitle,
              description: `Acesso ao curso: ${input.courseTitle}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
        courseId: input.courseId,
        type: 'course_purchase',
        instructorId: instructorId || '',
      },
    };

    // Add customer_email only if present
    if (input.userEmail) {
      sessionParams.customer_email = input.userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[PaymentService] Sessão criada:', session.id);
    return session;
  } catch (error) {
    console.error('[PaymentService] Erro ao criar checkout:', error);
    throw error;
  }
}

/**
 * Cria sessão de assinatura (student ou teacher)
 */
export async function createSubscriptionSession(
  input: CreateSubscriptionInput
): Promise<Stripe.Checkout.Session> {
  if (!input.priceId) {
    throw new Error('Price ID é obrigatório para assinatura');
  }

  console.log('[PaymentService] Criando assinatura:', {
    priceId: input.priceId,
    userEmail: input.userEmail,
  });

  try {
    const stripe = getStripeClient();

    // Build session params dynamically
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
        ...input.metadata,
      },
    };

    // Add customer_email only if present
    if (input.userEmail) {
      sessionParams.customer_email = input.userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[PaymentService] Assinatura criada:', session.id);
    return session;
  } catch (error) {
    console.error('[PaymentService] Erro ao criar assinatura:', error);
    throw error;
  }
}

/**
 * Cancela uma assinatura
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string
): Promise<void> {
  console.log('[PaymentService] Cancelando assinatura:', subscriptionId);

  try {
    const stripe = getStripeClient();
    await stripe.subscriptions.cancel(subscriptionId);

    // Registrar auditoria
    await logAuditTrail({
      userId,
      action: AuditAction.SUBSCRIPTION_CANCELLED,
      targetId: subscriptionId,
      targetType: 'Subscription',
      metadata: { stripeSubscriptionId: subscriptionId },
    });

    console.log('[PaymentService] Assinatura cancelada:', subscriptionId);
  } catch (error) {
    console.error('[PaymentService] Erro ao cancelar assinatura:', error);
    throw error;
  }
}

/**
 * Valida assinatura de webhook (CRÍTICO PARA SEGURANÇA)
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return event;
  } catch (error) {
    console.error('[PaymentService] Erro ao validar webhook:', error);
    throw error;
  }
}

/**
 * Recupera detalhes da sessão de checkout
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('[PaymentService] Erro ao recuperar sessão:', error);
    throw error;
  }
}

/**
 * Reembolsa um pagamento
 */
export async function refundPayment(
  paymentIntentId: string,
  userId: string
): Promise<Stripe.Refund> {
  console.log('[PaymentService] Reembolsando:', paymentIntentId);

  try {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Registrar auditoria
    await logAuditTrail({
      userId,
      action: AuditAction.PAYMENT_REFUNDED,
      targetId: paymentIntentId,
      targetType: 'Payment',
      metadata: { refundId: refund.id },
    });

    console.log('[PaymentService] Reembolso criado:', refund.id);
    return refund;
  } catch (error) {
    console.error('[PaymentService] Erro ao reembolsar:', error);
    throw error;
  }
}

type StripeWebhookResult = {
  status: number;
  body: Record<string, unknown>;
};

export type FinancialStats = {
  grossRevenue: number;
  churnCount: number;
  activeStudents: number;
  currency: string;
  windowDays: number;
};

export function calculateRevenueSplit(
  amount: number,
  hasPaidPlan: boolean = false
) {
  // 5% para plano FREE, 0% para plano PAGO
  const feeRate = hasPaidPlan
    ? 0
    : Number(process.env.PLATFORM_FEE_PERCENT ?? '0.05');

  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const platformFee = Math.max(0, Number((safeAmount * feeRate).toFixed(2)));
  const instructorNet = Math.max(
    0,
    Number((safeAmount - platformFee).toFixed(2))
  );

  return {
    totalAmount: safeAmount,
    platformFee,
    instructorNet,
    feeRate,
  };
}

type CheckoutMetadata = {
  userId?: string;
  courseId?: string;
  courseIds?: string;
  type?: string;
};

async function hasProcessedEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.auditLog.findFirst({
    where: {
      targetId: eventId,
      action: AuditAction.PAYMENT_WEBHOOK_PROCESSED,
    },
    select: { id: true },
  });

  return Boolean(existing);
}

async function resolveAuditUserId(preferredUserId?: string | null) {
  if (preferredUserId) return preferredUserId;
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  return admin?.id ?? null;
}

async function markEventProcessed(
  eventId: string,
  eventType: string,
  userId?: string | null,
  metadata?: Record<string, unknown>
) {
  const auditUserId = await resolveAuditUserId(userId);
  if (!auditUserId) return;

  await logAuditTrail({
    userId: auditUserId,
    action: AuditAction.PAYMENT_WEBHOOK_PROCESSED,
    targetId: eventId,
    targetType: eventType,
    metadata: {
      stripeEventId: eventId,
      ...metadata,
    },
  });
}

function safeCheckoutMetadata(
  input: Stripe.Checkout.Session
): CheckoutMetadata {
  const metadata = (input.metadata || {}) as Record<string, string>;
  return {
    userId: metadata.userId,
    courseId: metadata.courseId,
    type: metadata.type,
    courseIds: metadata.courseIds,
  };
}

function safeSubscriptionMetadata(input: Stripe.Subscription) {
  const metadata = (input.metadata || {}) as Record<string, string>;
  return {
    userId: metadata.userId,
    plan: metadata.plan,
    type: metadata.type,
  };
}

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null
): Promise<StripeWebhookResult> {
  if (!signature) {
    return { status: 400, body: { error: 'Missing signature' } };
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    console.error('[PaymentService] Invalid webhook signature', error);
    return { status: 400, body: { error: 'Invalid signature' } };
  }

  if (await hasProcessedEvent(event.id)) {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id
        );
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          event.id
        );
        break;
      }
      default: {
        console.log('[PaymentService] Unhandled event:', event.type);
      }
    }

    const metadata =
      event.type === 'checkout.session.completed'
        ? safeCheckoutMetadata(event.data.object as Stripe.Checkout.Session)
        : event.type === 'customer.subscription.deleted'
        ? safeSubscriptionMetadata(event.data.object as Stripe.Subscription)
        : undefined;

    await markEventProcessed(event.id, event.type, metadata?.userId, {
      metadata,
    });

    return { status: 200, body: { received: true } };
  } catch (error) {
    console.error('[PaymentService] Error handling webhook:', error);
    return { status: 500, body: { error: 'Webhook processing failed' } };
  }
}

export async function getFinancialStats(
  instructorId?: string
): Promise<FinancialStats> {
  const windowDays = 30;
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  // Filtros condicionais para isolamento por instrutor
  const paymentWhere: Prisma.PaymentWhereInput = {
    status: 'completed',
    ...(instructorId
      ? {
          course: {
            instructorId,
            deletedAt: null,
          },
        }
      : {}),
  };

  const enrollmentWhere: Prisma.EnrollmentWhereInput = instructorId
    ? {
        status: 'ACTIVE',
        course: { instructorId, deletedAt: null },
      }
    : { status: 'ACTIVE' };

  // Churn global: cancelamentos no último mês (ação de auditoria)
  // Para instrutor: cancelamentos de matrículas dos cursos dele no último mês
  const churnCountPromise = instructorId
    ? prisma.enrollment.count({
        where: {
          status: 'CANCELLED',
          updatedAt: { gte: windowStart },
          course: { instructorId, deletedAt: null },
        },
      })
    : prisma.auditLog.count({
        where: {
          action: AuditAction.SUBSCRIPTION_CANCELLED,
          createdAt: { gte: windowStart },
        },
      });

  const [paymentsAgg, activeStudents, churnCount] = await Promise.all([
    prisma.payment.aggregate({
      where: paymentWhere,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.enrollment.count({ where: enrollmentWhere }),
    churnCountPromise,
  ]);

  return {
    grossRevenue: paymentsAgg._sum.amount || 0,
    churnCount,
    activeStudents,
    currency: 'BRL',
    windowDays,
  };
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const metadata = safeCheckoutMetadata(session);

  if (!metadata.userId) {
    console.error('[PaymentService] Missing userId in metadata');
    return;
  }

  // ========== CHECKOUT MÚLTIPLO ==========
  if (metadata.type === 'multiple_courses' && metadata.courseIds) {
    try {
      const courseIds = metadata.courseIds.split(',');

      // Validar que não há cursos duplicados
      if (new Set(courseIds).size !== courseIds.length) {
        console.error(
          '[PaymentService] Duplicate courseIds detected in multiple checkout'
        );
        return;
      }

      // Validar limite de cursos (máximo 50 por transação para evitar timeout)
      if (courseIds.length > 50) {
        console.error(
          '[PaymentService] Too many courses in single checkout (max 50)'
        );
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.id;
      const currency = session.currency || 'BRL';
      const isTest = session.livemode === false;

      // Buscar todos os cursos
      const courses = await prisma.course.findMany({
        where: {
          id: { in: courseIds },
          isPublished: true,
          deletedAt: null, // Não permitir cursos soft-deleted
        },
        select: {
          id: true,
          title: true,
          price: true,
          instructorId: true,
        },
      });

      if (courses.length === 0) {
        console.error(
          '[PaymentService] No courses found for multiple checkout'
        );
        return;
      }

      // Validar que todos os cursos requisitados foram encontrados
      if (courses.length !== courseIds.length) {
        console.warn(
          '[PaymentService] Some courses not found or not published',
          {
            requestedCount: courseIds.length,
            foundCount: courses.length,
            notFound: courseIds.filter(
              (id) => !courses.find((c) => c.id === id)
            ),
          }
        );
        // Continuar com os cursos encontrados
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: metadata.userId },
        select: { id: true, email: true, name: true, deletedAt: true },
      });

      if (!user?.email || user.deletedAt) {
        console.error(
          '[PaymentService] User not found or deleted for multiple checkout'
        );
        return;
      }

      // Calcular total
      const totalAmount = courses.reduce(
        (sum, course) => sum + (course.price || 0),
        0
      );

      await prisma.$transaction(async (tx) => {
        // Criar matrículas para cada curso
        for (const course of courses) {
          // 🛡️ RED LINE: Instrutor não pode comprar próprio curso
          if (course.instructorId === metadata.userId) {
            console.warn(
              '[PaymentService] Bloqueado: Instrutor tentou comprar próprio curso',
              {
                userId: metadata.userId,
                courseId: course.id,
                courseTitle: course.title,
              }
            );

            // Registrar tentativa de fraude em auditoria
            await tx.auditLog.create({
              data: {
                userId: metadata.userId as string,
                action: AuditAction.SECURITY_VIOLATION,
                targetId: course.id,
                targetType: 'Course',
                metadata: {
                  reason: 'OWN_COURSE_PURCHASE_BLOCKED',
                  stripeEventId: eventId,
                  courseId: course.id,
                  courseTitle: course.title,
                },
              },
            });

            continue; // Pular este curso
          }

          await tx.enrollment.upsert({
            where: {
              studentId_courseId: {
                studentId: metadata.userId as string,
                courseId: course.id,
              },
            },
            update: {
              status: 'ACTIVE',
            },
            create: {
              studentId: metadata.userId as string,
              courseId: course.id,
              status: 'ACTIVE',
            },
          });

          // Criar payout para cada instrutor (taxa de 5% da plataforma)
          const split = calculateRevenueSplit(course.price || 0, false);
          if (course.instructorId && split.instructorNet > 0) {
            await tx.payout.create({
              data: {
                teacherId: course.instructorId,
                amount: split.instructorNet,
                periodStart: new Date(),
                periodEnd: new Date(),
                status: 'pending',
                transferId: null,
                currency,
              },
            });
          }

          // Criar auditoria individual por curso
          await tx.auditLog.create({
            data: {
              userId: metadata.userId as string,
              action: AuditAction.PAYMENT_CREATED,
              targetId: course.id,
              targetType: 'Course',
              metadata: {
                stripeEventId: eventId,
                courseId: course.id,
                courseTitle: course.title,
                coursePrice: course.price,
                instructorId: course.instructorId,
              },
            },
          });
        }

        // Criar um único pagamento para o checkout múltiplo
        await tx.payment.create({
          data: {
            userId: metadata.userId as string,
            stripePaymentId: paymentIntentId,
            stripeIntentId: paymentIntentId,
            checkoutSessionId: session.id,
            amount: totalAmount,
            currency,
            paymentMethod: 'stripe',
            type: 'course',
            status: 'completed',
            isTest,
            metadata: {
              stripeEventId: eventId,
              sessionId: session.id,
              livemode: session.livemode,
              courseIds: courseIds.join(','),
              courseCount: courseIds.length,
            },
          },
        });

        // Atualizar sessão de checkout
        await tx.checkoutSession.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: 'completed',
            paymentIntentId,
            stripeCustomerId: session.customer
              ? String(session.customer)
              : null,
          },
        });

        // Registrar auditoria agregada do checkout múltiplo
        await tx.auditLog.create({
          data: {
            userId: metadata.userId as string,
            action: AuditAction.PAYMENT_CREATED,
            targetType: 'MultipleCourses',
            metadata: {
              stripeEventId: eventId,
              stripePaymentIntentId: paymentIntentId,
              courseIds: courseIds.join(','),
              courseCount: courseIds.length,
              totalAmount,
              courses: courses.map((c) => ({
                id: c.id,
                title: c.title,
                price: c.price,
                instructorId: c.instructorId,
              })),
            },
          },
        });

        // Log estruturado
        console.log('[PaymentService] ✅ MULTIPLE COURSES PURCHASE COMPLETED', {
          timestamp: new Date().toISOString(),
          userId: metadata.userId,
          courseCount: courseIds.length,
          courseIds: courseIds.join(','),
          courseDetails: courses.map((c) => ({
            id: c.id,
            title: c.title,
            price: c.price,
          })),
          totalAmount: `${totalAmount} ${currency}`,
          isTest,
          stripeEventId: eventId,
        });
      }); // Fechamento do $transaction
    } catch (error) {
      console.error('[PaymentService] ❌ MULTIPLE COURSES PURCHASE FAILED', {
        timestamp: new Date().toISOString(),
        userId: metadata.userId,
        courseIds: metadata.courseIds,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        stripeEventId: eventId,
      });
      throw error; // Re-throw para que o webhook saiba que houve erro
    }

    return;
  }

  // ========== CHECKOUT DE FEATURE ==========
  if (metadata.type === 'feature_purchase' && metadata.courseId === undefined) {
    const featureId = session.metadata?.featureId;

    if (!featureId) {
      console.error('[PaymentService] Missing featureId in feature purchase');
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.id;

    const featurePrices: Record<string, number> = {
      'ai-assistant': 29.9,
      mentorships: 49.9,
      'pro-tools': 39.9,
    };

    const amount = featurePrices[featureId] || 0;
    const currency = session.currency || 'BRL';
    const isTest = session.livemode === false;

    await prisma.$transaction(async (tx) => {
      // Criar ou atualizar FeaturePurchase
      const featurePurchaseResult = await tx.featurePurchase.upsert({
        where: {
          userId_featureId: {
            userId: metadata.userId as string,
            featureId,
          },
        },
        update: {
          status: 'active',
          purchaseDate: new Date(),
          stripePaymentId: paymentIntentId,
        },
        create: {
          userId: metadata.userId as string,
          featureId,
          status: 'active',
          stripePaymentId: paymentIntentId,
          amount,
          currency,
          metadata: {
            stripeEventId: eventId,
            sessionId: session.id,
            livemode: session.livemode,
          },
        },
      });

      // Registrar pagamento
      const paymentResult = await tx.payment.create({
        data: {
          userId: metadata.userId as string,
          stripePaymentId: paymentIntentId,
          stripeIntentId: paymentIntentId,
          checkoutSessionId: session.id,
          amount,
          currency,
          paymentMethod: 'stripe',
          type: 'feature',
          status: 'completed',
          isTest,
          metadata: {
            stripeEventId: eventId,
            sessionId: session.id,
            livemode: session.livemode,
            featureId,
          },
        },
      });

      // Atualizar sessão de checkout
      await tx.checkoutSession.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: 'completed',
          paymentIntentId,
          stripeCustomerId: session.customer ? String(session.customer) : null,
        },
      });

      // Registrar auditoria
      await tx.auditLog.create({
        data: {
          userId: metadata.userId as string,
          action: AuditAction.PAYMENT_CREATED,
          targetId: featureId,
          targetType: 'Feature',
          metadata: {
            stripeEventId: eventId,
            stripePaymentIntentId: paymentIntentId,
            featureId,
            featurePurchaseId: featurePurchaseResult.id,
            paymentId: paymentResult.id,
          },
        },
      });

      // Log estruturado CRÍTICO
      console.log('[PaymentService] ✅ FEATURE PURCHASE COMPLETED', {
        timestamp: new Date().toISOString(),
        userId: metadata.userId,
        featureId,
        status: featurePurchaseResult.status,
        stripePaymentId: paymentIntentId,
        amount: `${amount} ${currency}`,
        isTest,
        featurePurchaseId: featurePurchaseResult.id,
        paymentId: paymentResult.id,
        stripeEventId: eventId,
      });
    });

    return;
  }

  // Processando compra de curso (lógica existente)
  if (!metadata.userId || !metadata.courseId) {
    console.error('[PaymentService] Missing userId or courseId in metadata');
    return;
  }

  const [course, user] = await Promise.all([
    prisma.course.findUnique({
      where: { id: metadata.courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        instructorId: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: metadata.userId },
      select: { id: true, email: true, name: true },
    }),
  ]);

  if (!course || !user?.email) {
    console.error('[PaymentService] Course or user not found for checkout');
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.id;
  const amount = course.price ?? 0;
  const currency = session.currency || 'BRL';
  const isTest = session.livemode === false;

  const instructorId = course.instructorId;

  // Calcular split (taxa de 5% da plataforma)
  const split = calculateRevenueSplit(amount, false);

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: metadata.userId as string,
          courseId: metadata.courseId as string,
        },
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        studentId: metadata.userId as string,
        courseId: metadata.courseId as string,
        status: 'ACTIVE',
      },
    });

    await tx.payment.upsert({
      where: { stripePaymentId: paymentIntentId },
      update: {
        amount,
        currency,
        status: 'completed',
        checkoutSessionId: session.id,
        metadata: {
          stripeEventId: eventId,
          sessionId: session.id,
          livemode: session.livemode,
          instructorId,
          platformFee: split.platformFee,
          instructorNet: split.instructorNet,
          feeRate: split.feeRate,
        },
        stripeIntentId: paymentIntentId,
      },
      create: {
        userId: metadata.userId as string,
        courseId: metadata.courseId as string,
        stripePaymentId: paymentIntentId,
        stripeIntentId: paymentIntentId,
        checkoutSessionId: session.id,
        amount,
        currency,
        paymentMethod: 'stripe',
        type: 'course',
        status: 'completed',
        isTest,
        metadata: {
          stripeEventId: eventId,
          sessionId: session.id,
          livemode: session.livemode,
          instructorId,
          platformFee: split.platformFee,
          instructorNet: split.instructorNet,
          feeRate: split.feeRate,
        },
      },
    });

    await tx.checkoutSession.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: 'completed',
        paymentIntentId,
        stripeCustomerId: session.customer ? String(session.customer) : null,
      },
    });

    if (instructorId && split.instructorNet > 0) {
      await tx.payout.create({
        data: {
          teacherId: instructorId,
          amount: split.instructorNet,
          periodStart: new Date(),
          periodEnd: new Date(),
          status: 'pending',
          transferId: null,
          currency,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: metadata.userId as string,
        action: AuditAction.PAYMENT_CREATED,
        targetId: course.id,
        targetType: 'Course',
        metadata: {
          stripeEventId: eventId,
          stripePaymentIntentId: paymentIntentId,
          courseId: course.id,
          instructorId,
          platformFee: split.platformFee,
          instructorNet: split.instructorNet,
        },
      },
    });
  });

  const courseUrlBase = process.env.NEXT_PUBLIC_APP_URL || '';
  const courseUrl = `${courseUrlBase}/courses/${course.slug}`;

  await sendWelcomeEmail(
    user.email,
    user.name || 'Aluno',
    course.title,
    courseUrl,
    user.id
  );
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  eventId: string
) {
  const metadata = safeSubscriptionMetadata(subscription);
  const userId = metadata.userId;

  if (!userId) {
    console.error('[PaymentService] Missing userId in subscription metadata');
    return;
  }

  const statusUpdateDate = new Date();
  const subscriptionId = subscription.id;

  await prisma.$transaction(async (tx) => {
    if (metadata.type === 'student_subscription') {
      await tx.studentSubscription.updateMany({
        where: { userId },
        data: { status: 'cancelled', cancelAt: statusUpdateDate },
      });

      await tx.enrollment.updateMany({
        where: { studentId: userId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });
    }

    if (metadata.type === 'teacher_subscription') {
      await tx.teacherSubscription.updateMany({
        where: { userId },
        data: { status: 'cancelled', cancelDate: statusUpdateDate },
      });

      await tx.teacherFinancial.updateMany({
        where: { userId },
        data: { subscriptionStatus: 'inactive' },
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: AuditAction.SUBSCRIPTION_CANCELLED,
        targetId: subscriptionId,
        targetType: 'Subscription',
        metadata: {
          stripeEventId: eventId,
          reason: 'customer.subscription.deleted',
          type: metadata.type,
        },
      },
    });
  });
}
