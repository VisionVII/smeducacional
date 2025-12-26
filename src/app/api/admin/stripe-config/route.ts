import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/admin/stripe-config
 * Retorna configurações Stripe e pagamentos internacionais
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const config = await prisma.systemConfig.findFirst({
      select: {
        stripePublishableKey: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
        defaultCurrency: true,
        supportedCurrencies: true,
        pricesByCountry: true,
        paymentMethods: true,
        taxConfiguration: true,
        stripeAccountId: true,
        autoPayoutEnabled: true,
        payoutSchedule: true,
      },
    });

    if (!config) {
      // Retornar config padrão
      return NextResponse.json({
        defaultCurrency: 'BRL',
        supportedCurrencies: ['BRL', 'USD', 'EUR'],
        pricesByCountry: [],
        paymentMethods: {
          card: true,
          pix: true,
          boleto: true,
        },
        taxConfiguration: {},
        autoPayoutEnabled: false,
        payoutSchedule: 'weekly',
      });
    }

    // Parse JSON fields
    const supportedCurrencies =
      typeof config.supportedCurrencies === 'string'
        ? JSON.parse(config.supportedCurrencies)
        : config.supportedCurrencies || ['BRL', 'USD', 'EUR'];

    const pricesByCountry =
      typeof config.pricesByCountry === 'string'
        ? JSON.parse(config.pricesByCountry)
        : config.pricesByCountry || [];

    const paymentMethods =
      typeof config.paymentMethods === 'string'
        ? JSON.parse(config.paymentMethods)
        : config.paymentMethods || { card: true, pix: true, boleto: true };

    const taxConfiguration =
      typeof config.taxConfiguration === 'string'
        ? JSON.parse(config.taxConfiguration)
        : config.taxConfiguration || {};

    return NextResponse.json({
      stripePublishableKey: config.stripePublishableKey,
      stripeSecretKey: config.stripeSecretKey
        ? '••••••••' + config.stripeSecretKey.slice(-4)
        : undefined, // Mascarar secret key
      stripeWebhookSecret: config.stripeWebhookSecret
        ? '••••••••' + config.stripeWebhookSecret.slice(-4)
        : undefined,
      defaultCurrency: config.defaultCurrency,
      supportedCurrencies,
      pricesByCountry,
      paymentMethods,
      taxConfiguration,
      stripeAccountId: config.stripeAccountId,
      autoPayoutEnabled: config.autoPayoutEnabled,
      payoutSchedule: config.payoutSchedule,
    });
  } catch (error) {
    console.error('[admin/stripe-config GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stripe-config
 * Atualiza configurações Stripe
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const countryPriceSchema = z.object({
      country: z.string().length(2),
      currency: z.string().length(3),
      basicPrice: z.number().min(0),
      proPrice: z.number().min(0),
      premiumPrice: z.number().min(0),
      adSlotPrice: z.number().min(0),
    });

    const schema = z.object({
      stripePublishableKey: z.string().optional(),
      stripeSecretKey: z.string().optional(),
      stripeWebhookSecret: z.string().optional(),
      defaultCurrency: z.string().length(3).optional(),
      supportedCurrencies: z.array(z.string().length(3)).optional(),
      pricesByCountry: z.array(countryPriceSchema).optional(),
      paymentMethods: z.record(z.boolean()).optional(),
      taxConfiguration: z.record(z.any()).optional(),
      stripeAccountId: z.string().optional(),
      autoPayoutEnabled: z.boolean().optional(),
      payoutSchedule: z
        .enum(['daily', 'weekly', 'biweekly', 'monthly'])
        .optional(),
    });

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Se stripeSecretKey está mascarada, buscar a existente
    let secretKey = result.data.stripeSecretKey;
    if (secretKey && secretKey.startsWith('••••••••')) {
      const existing = await prisma.systemConfig.findFirst({
        select: { stripeSecretKey: true },
      });
      secretKey = existing?.stripeSecretKey || undefined;
    }

    // Se stripeWebhookSecret está mascarada, buscar a existente
    let webhookSecret = result.data.stripeWebhookSecret;
    if (webhookSecret && webhookSecret.startsWith('••••••••')) {
      const existing = await prisma.systemConfig.findFirst({
        select: { stripeWebhookSecret: true },
      });
      webhookSecret = existing?.stripeWebhookSecret || undefined;
    }

    // Preparar dados para salvar (JSON fields)
    const updateData: any = {};

    if (result.data.stripePublishableKey !== undefined)
      updateData.stripePublishableKey = result.data.stripePublishableKey;
    if (secretKey !== undefined) updateData.stripeSecretKey = secretKey;
    if (webhookSecret !== undefined)
      updateData.stripeWebhookSecret = webhookSecret;
    if (result.data.defaultCurrency !== undefined)
      updateData.defaultCurrency = result.data.defaultCurrency;
    if (result.data.stripeAccountId !== undefined)
      updateData.stripeAccountId = result.data.stripeAccountId;
    if (result.data.autoPayoutEnabled !== undefined)
      updateData.autoPayoutEnabled = result.data.autoPayoutEnabled;
    if (result.data.payoutSchedule !== undefined)
      updateData.payoutSchedule = result.data.payoutSchedule;

    // JSON fields
    if (result.data.supportedCurrencies !== undefined)
      updateData.supportedCurrencies = result.data.supportedCurrencies;
    if (result.data.pricesByCountry !== undefined)
      updateData.pricesByCountry = result.data.pricesByCountry;
    if (result.data.paymentMethods !== undefined)
      updateData.paymentMethods = result.data.paymentMethods;
    if (result.data.taxConfiguration !== undefined)
      updateData.taxConfiguration = result.data.taxConfiguration;

    const config = await prisma.systemConfig.upsert({
      where: { key: 'system' },
      create: {
        key: 'system',
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      data: config,
      message: 'Configurações Stripe atualizadas com sucesso',
    });
  } catch (error) {
    console.error('[admin/stripe-config PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
