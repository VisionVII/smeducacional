import Stripe from 'stripe';

// Lazy init para não quebrar build quando STRIPE_SECRET_KEY não existe
export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe secret key not configured');
  }

  // Versão atual da API do Stripe
  return new Stripe(key, {
    apiVersion: '2025-11-17.clover',
  });
}

/**
 * Preços padrão do Stripe para Subscriptions
 */
export const STRIPE_PRICES = {
  studentBasic: process.env.STRIPE_STUDENT_BASIC_PRICE_ID || '',
  studentPremium: process.env.STRIPE_STUDENT_PREMIUM_PRICE_ID || '',
  teacherBasic: process.env.STRIPE_TEACHER_BASIC_PRICE_ID || '',
  teacherPremium: process.env.STRIPE_TEACHER_PREMIUM_PRICE_ID || '',
  teacherEnterprise: process.env.STRIPE_TEACHER_ENTERPRISE_PRICE_ID || '',
};

/**
 * Cria uma sessão de checkout para compra de curso
 */
export async function createCourseCheckoutSession({
  userId,
  courseId,
  courseTitle,
  coursePrice,
  userEmail,
  successUrl,
  cancelUrl,
  paymentMethodTypes = ['card'],
}: {
  userId: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  paymentMethodTypes?: string[];
}) {
  // Validação antes de criar sessão
  if (!userEmail || userEmail.trim() === '') {
    throw new Error('Email do usuário é obrigatório para checkout');
  }

  const unitAmount = Math.round(coursePrice * 100);
  if (unitAmount <= 0) {
    throw new Error(
      `Preço inválido: ${coursePrice} (resultou em unit_amount: ${unitAmount})`
    );
  }

  console.log('[Stripe] Criando sessão de checkout:', {
    courseTitle,
    coursePrice,
    unitAmount,
    userEmail,
    paymentMethodTypes,
  });

  try {
    const stripe = getStripeClient();

    const sessionParams: any = {
      mode: 'payment',
      payment_method_types:
        paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: courseTitle,
              description: `Acesso ao curso: ${courseTitle}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        courseId,
        type: 'course_purchase',
      },
    };

    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[Stripe] Sessão criada com sucesso:', session.id);
    return session;
  } catch (error) {
    console.error(
      '[Stripe] Erro ao criar sessão:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Cria uma sessão de checkout para subscrição de estudante
 */
export async function createStudentSubscriptionCheckoutSession({
  userId,
  plan,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  plan: 'basic' | 'premium';
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId =
    plan === 'premium'
      ? STRIPE_PRICES.studentPremium
      : STRIPE_PRICES.studentBasic;

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for student ${plan} plan`);
  }

  const stripe = getStripeClient();

  const sessionParams: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
      type: 'student_subscription',
    },
  };

  if (userEmail) {
    sessionParams.customer_email = userEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Cria uma sessão de checkout para subscrição de professor
 */
export async function createTeacherSubscriptionCheckoutSession({
  userId,
  plan,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  let priceId: string;

  switch (plan) {
    case 'premium':
      priceId = STRIPE_PRICES.teacherPremium;
      break;
    case 'enterprise':
      priceId = STRIPE_PRICES.teacherEnterprise;
      break;
    default:
      priceId = STRIPE_PRICES.teacherBasic;
  }

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for teacher ${plan} plan`);
  }

  const stripe = getStripeClient();

  const sessionParams: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
      type: 'teacher_subscription',
    },
  };

  if (userEmail) {
    sessionParams.customer_email = userEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Processa webhook de evento Stripe
 */
export async function processStripeWebhook(event: Stripe.Event) {
  const { data, type } = event;

  switch (type) {
    case 'checkout.session.completed': {
      const session = data.object as Stripe.Checkout.Session;
      return {
        type: 'checkout_completed',
        session,
      };
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = data.object as Stripe.Subscription;
      return {
        type: 'subscription_updated',
        subscription,
      };
    }

    case 'customer.subscription.deleted': {
      const subscription = data.object as Stripe.Subscription;
      return {
        type: 'subscription_cancelled',
        subscription,
      };
    }

    case 'invoice.payment_succeeded': {
      const invoice = data.object as Stripe.Invoice;
      return {
        type: 'invoice_paid',
        invoice,
      };
    }

    case 'invoice.payment_failed': {
      const invoice = data.object as Stripe.Invoice;
      return {
        type: 'invoice_failed',
        invoice,
      };
    }

    case 'account.updated': {
      const account = data.object as Stripe.Account;
      return {
        type: 'account_updated',
        account,
      };
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = data.object as Stripe.PaymentIntent;
      return {
        type: 'payment_intent_succeeded',
        paymentIntent,
      };
    }

    default:
      return {
        type: 'unknown',
        event,
      };
  }
}
