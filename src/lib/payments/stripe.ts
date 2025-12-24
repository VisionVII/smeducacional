import { createCourseCheckoutSession } from '@/lib/stripe';
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
} from './provider';

export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  async createSession(input: CheckoutRequest): Promise<CheckoutSession> {
    const session = await createCourseCheckoutSession({
      userId: input.userId,
      courseId: input.courseId,
      courseTitle: input.courseTitle,
      coursePrice: input.coursePrice,
      userEmail: input.userEmail,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      // Mantemos comportamento atual (cartão)
    });
    return { id: session.id, url: session.url! };
  },
};

// Stripe com Pix (Brasil)
export const stripePixProvider: PaymentProvider = {
  id: 'stripe_pix',
  async createSession(input: CheckoutRequest): Promise<CheckoutSession> {
    // Se o helper suportar payment_method_types, adapte aqui
    const session = await createCourseCheckoutSession({
      userId: input.userId,
      courseId: input.courseId,
      courseTitle: input.courseTitle,
      coursePrice: input.coursePrice,
      userEmail: input.userEmail,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      paymentMethodTypes: ['pix'],
    } as any);
    return { id: session.id, url: session.url! };
  },
};
