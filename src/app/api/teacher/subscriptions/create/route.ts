import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

const schema = z.object({
  priceId: z.string().min(1), // Stripe Price ID (ex.: price_1234)
});

/**
 * POST /api/teacher/subscriptions/create
 * Cria sessão de checkout para subscription de professor (mensalidade)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { priceId } = parsed.data;

    // Verificar se já tem subscription ativa
    const existing = await prisma.teacherSubscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: 'Você já possui uma assinatura ativa' },
        { status: 400 }
      );
    }

    // Criar ou resgatar customer Stripe
    let customerId = existing?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { userId: session.user.id, role: 'TEACHER' },
      });
      customerId = customer.id;
    }

    // Criar checkout session para subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/teacher/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/teacher/subscriptions`,
      metadata: {
        userId: session.user.id,
        type: 'teacher_subscription',
      },
    });

    // Salvar checkout session
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        stripeSessionId: checkoutSession.id,
        stripeCustomerId: customerId,
        mode: 'subscription',
        status: 'pending',
        url: checkoutSession.url!,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('[API /teacher/subscriptions/create]', error);
    return NextResponse.json(
      { error: 'Erro ao criar subscription' },
      { status: 500 }
    );
  }
}
