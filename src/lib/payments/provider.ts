export type CheckoutProvider = 'stripe' | 'stripe_pix' | 'mbay';

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CheckoutRequest {
  userId: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentProvider {
  id: CheckoutProvider;
  createSession(input: CheckoutRequest): Promise<CheckoutSession>;
}
