import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTeacherSubscriptionCheckoutSession } from '@/lib/stripe';

type TeacherSubscriptionPlan = 'basic' | 'premium' | 'enterprise';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas professores podem se inscrever
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Apenas professores podem se inscrever em planos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['basic', 'premium', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Verificar se já tem subscrição ativa
    const existingSubscription = await prisma.teacherSubscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Você já possui uma subscrição ativa' },
        { status: 400 }
      );
    }

    // Criar sessão de checkout
    const checkoutSession = await createTeacherSubscriptionCheckoutSession({
      userId: session.user.id,
      plan: plan as TeacherSubscriptionPlan,
      userEmail: session.user.email,
      successUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success?type=teacher_subscription`,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL}/teacher/subscriptions`,
    });

    // Salvar sessão de checkout no banco
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        teacherSubscriptionId: existingSubscription?.id,
        stripeSessionId: checkoutSession.id,
        url: checkoutSession.url,
        status: 'pending',
        mode: 'subscription',
        metadata: { plan },
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Erro ao criar sessão de subscrição de professor:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de subscrição' },
      { status: 500 }
    );
  }
}
