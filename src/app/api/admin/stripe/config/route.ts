import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  StripeConfigService,
  StripeKeyInput,
} from '@/lib/services/stripe-config.service';
import { z } from 'zod';

/**
 * GET /api/admin/stripe/config
 * Obtém status de todas as configurações do Stripe
 * ✅ Apenas ADMIN
 */
export async function GET() {
  console.log('[StripeConfig] GET request received');
  try {
    const session = await auth();

    // Validar autenticação e role
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter status de ambas as configurações
    const statuses = await StripeConfigService.getAllConfigStatus();

    return NextResponse.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error('[StripeConfig] GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stripe/config
 * Valida e salva novas chaves Stripe
 * ✅ Apenas ADMIN
 */
const SaveStripeConfigSchema = z.object({
  secretKey: z
    .string()
    .min(1, 'Secret Key obrigatória')
    .refine((val) => val.startsWith('sk_'), 'Secret Key deve começar com sk_'),
  publishableKey: z
    .string()
    .min(1, 'Publishable Key obrigatória')
    .refine(
      (val) => val.startsWith('pk_'),
      'Publishable Key deve começar com pk_'
    ),
  webhookSecret: z
    .string()
    .min(1, 'Webhook Secret obrigatório')
    .refine(
      (val) => val.startsWith('whsec_'),
      'Webhook Secret deve começar com whsec_'
    ),
  environment: z.enum(['test', 'production']),
});

export async function POST(req: NextRequest) {
  console.log('[StripeConfig] POST request received');
  try {
    const session = await auth();

    // Validar autenticação e role
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Parse e validação
    const body = await req.json();
    const validated = SaveStripeConfigSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Validar e salvar
    const result = await StripeConfigService.saveStripeConfig(
      validated.data as StripeKeyInput
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      status: result.status,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';

    console.error('[StripeConfig] POST error:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/admin/stripe/config
 * Apenas valida as chaves sem salvar
 * ✅ Apenas ADMIN
 */
export async function PUT(req: NextRequest) {
  console.log('[StripeConfig] PUT request received');
  try {
    const session = await auth();

    // Validar autenticação e role
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Parse e validação
    const body = await req.json();
    const validated = SaveStripeConfigSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Apenas validar, sem salvar
    const status = await StripeConfigService.validateStripeKey(
      validated.data as StripeKeyInput
    );

    return NextResponse.json({
      success: status.connected,
      status,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';

    console.error('[StripeConfig] PUT error:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
