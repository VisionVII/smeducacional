import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/feature-purchases/:userId
 * Debug endpoint para verificar FeaturePurchase de um usuário
 * RESTRITO A ADMIN
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    // Validar autenticação e role ADMIN
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Buscar todas as FeaturePurchases do usuário
    const featurePurchases = await prisma.featurePurchase.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        featureId: true,
        status: true,
        purchaseDate: true,
        stripePaymentId: true,
        amount: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
      },
    });

    // Buscar pagamentos relacionados
    const payments = await prisma.payment.findMany({
      where: {
        userId,
        type: 'feature',
      },
      select: {
        id: true,
        stripePaymentId: true,
        stripeIntentId: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Buscar CheckoutSessions relacionadas
    const checkoutSessions = await prisma.checkoutSession.findMany({
      where: { userId },
      select: {
        id: true,
        stripeSessionId: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Buscar logs de auditoria
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        action: {
          in: ['PAYMENT_CREATED', 'PAYMENT_WEBHOOK_PROCESSED'],
        },
      },
      select: {
        id: true,
        action: true,
        targetId: true,
        targetType: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(
      {
        userId,
        summary: {
          totalFeaturePurchases: featurePurchases.length,
          activeFeatures: featurePurchases.filter((f) => f.status === 'active')
            .length,
          totalPayments: payments.length,
          completedPayments: payments.filter((p) => p.status === 'completed')
            .length,
        },
        featurePurchases,
        payments,
        checkoutSessions,
        auditLogs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AdminDebugAPI] Erro ao buscar feature purchases:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao processar requisição',
      },
      { status: 500 }
    );
  }
}
