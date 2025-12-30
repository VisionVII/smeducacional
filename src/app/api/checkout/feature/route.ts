import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';
import { z } from 'zod';

/**
 * Schema de validação para checkout de feature
 */
const CheckoutFeatureSchema = z.object({
  featureId: z.enum(['ai-assistant', 'mentorships', 'pro-tools'], {
    required_error: 'featureId é obrigatório',
    invalid_type_error:
      'featureId deve ser: ai-assistant, mentorships ou pro-tools',
  }),
});

/**
 * Configuração de preços das features
 */
const FEATURE_PRICING = {
  'ai-assistant': {
    name: 'Chat IA - Professor Virtual',
    description: 'Assistente de IA dedicado aos seus cursos matriculados',
    price: 29.9,
    currency: 'BRL',
  },
  mentorships: {
    name: 'Mentorias Personalizadas',
    description: 'Acesso a mentorias 1-on-1 com professores',
    price: 49.9,
    currency: 'BRL',
  },
  'pro-tools': {
    name: 'Ferramentas Pro',
    description: 'Conjunto avançado de ferramentas para produtividade',
    price: 39.9,
    currency: 'BRL',
  },
};

/**
 * POST /api/checkout/feature
 * Cria sessão de checkout do Stripe para compra de feature standalone
 */
export async function POST(request: Request) {
  try {
    // Validar autenticação
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Validar body
    const body = await request.json();
    const validation = CheckoutFeatureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { featureId } = validation.data;

    // Verificar se usuário já tem acesso à feature
    const userRole = session.user.role as 'STUDENT' | 'TEACHER' | 'ADMIN';

    // Admin sempre tem acesso
    if (userRole === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admins já têm acesso a todas as features' },
        { status: 400 }
      );
    }

    // Verificar subscrição ativa
    if (userRole === 'TEACHER') {
      const subscription = await prisma.teacherSubscription.findUnique({
        where: { userId: session.user.id },
      });

      if (subscription && subscription.status === 'active') {
        // Verificar se plano já inclui a feature
        const planFeatures = {
          basic: ['ai-assistant'],
          premium: ['ai-assistant', 'mentorships', 'pro-tools'],
          enterprise: ['ai-assistant', 'mentorships', 'pro-tools', 'analytics'],
        };

        const features =
          planFeatures[subscription.plan as keyof typeof planFeatures] || [];
        if (features.includes(featureId)) {
          return NextResponse.json(
            { error: 'Você já tem acesso a esta feature no seu plano atual' },
            { status: 400 }
          );
        }
      }
    } else if (userRole === 'STUDENT') {
      const subscription = await prisma.studentSubscription.findUnique({
        where: { userId: session.user.id },
      });

      if (subscription && subscription.status === 'active') {
        const planFeatures = {
          basic: ['ai-assistant'],
          premium: ['ai-assistant', 'mentorships', 'pro-tools'],
        };

        const features =
          planFeatures[subscription.plan as keyof typeof planFeatures] || [];
        if (features.includes(featureId)) {
          return NextResponse.json(
            { error: 'Você já tem acesso a esta feature no seu plano atual' },
            { status: 400 }
          );
        }
      }
    }

    // Verificar se usuário já comprou a feature standalone
    const existingPurchase = await prisma.featurePurchase.findUnique({
      where: {
        userId_featureId: {
          userId: session.user.id,
          featureId,
        },
      },
    });

    if (existingPurchase && existingPurchase.status === 'active') {
      return NextResponse.json(
        { error: 'Você já possui acesso a esta feature' },
        { status: 400 }
      );
    }

    // Buscar dados da feature
    const feature = FEATURE_PRICING[featureId];

    // Criar sessão de checkout do Stripe
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: feature.name,
              description: feature.description,
            },
            unit_amount: Math.round(feature.price * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?type=feature_purchase&featureId=${featureId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/chat-ia`,
      metadata: {
        userId: session.user.id,
        featureId,
        type: 'feature_purchase',
      },
    });

    // Salvar sessão de checkout no banco
    await prisma.checkoutSession.create({
      data: {
        userId: session.user.id,
        featureId,
        stripeSessionId: checkoutSession.id,
        url: checkoutSession.url || '',
        status: 'pending',
        mode: 'payment',
        amount: feature.price,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout de feature:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
