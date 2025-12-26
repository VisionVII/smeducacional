import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

/**
 * POST /api/admin/stripe-config/test
 * Testa conexão com Stripe usando as credenciais fornecidas
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { publishableKey, secretKey } = body;

    if (!publishableKey || !secretKey) {
      return NextResponse.json(
        { error: 'Chaves Stripe são obrigatórias' },
        { status: 400 }
      );
    }

    // Validar formato das chaves
    if (!publishableKey.startsWith('pk_') || !secretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Formato de chaves inválido' },
        { status: 400 }
      );
    }

    // Verificar se são chaves do mesmo ambiente
    const pkEnv = publishableKey.split('_')[1]; // test ou live
    const skEnv = secretKey.split('_')[1];

    if (pkEnv !== skEnv) {
      return NextResponse.json(
        {
          error: 'Chaves de ambientes diferentes (test vs live)',
        },
        { status: 400 }
      );
    }

    try {
      // Tentar conectar com Stripe
      const stripe = new Stripe(secretKey, {
        apiVersion: '2025-11-17.clover',
      });

      // Buscar informações da conta
      const account = await stripe.accounts.retrieve();

      return NextResponse.json({
        success: true,
        accountId: account.id,
        environment: pkEnv === 'test' ? 'test' : 'live',
        country: account.country,
        defaultCurrency: account.default_currency,
        email: account.email,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        message: 'Conexão Stripe bem-sucedida!',
      });
    } catch (stripeError) {
      const error = stripeError as Error;
      console.error('[Stripe Test Error]', error);

      return NextResponse.json(
        {
          error:
            error.message ||
            'Erro ao conectar com Stripe. Verifique as credenciais.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[admin/stripe-config/test POST]', error);
    return NextResponse.json(
      { error: 'Erro ao testar conexão' },
      { status: 500 }
    );
  }
}
