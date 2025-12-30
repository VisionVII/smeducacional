import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payment.service';

/**
 * POST /api/webhooks/stripe
 * Processa webhooks do Stripe
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  const result = await handleStripeWebhook(rawBody, signature);
  return NextResponse.json(result.body, { status: result.status });
}
