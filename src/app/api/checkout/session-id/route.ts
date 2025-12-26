import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/checkout/session-id?courseId=...
 * Recupera o session ID da sessão de checkout mais recente (pendente)
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[Checkout/SessionId] Buscando sessão para:', {
      userId: session.user.id,
      courseId,
    });

    // Buscar a sessão de checkout mais recente (status pending ou completed)
    const checkoutSession = await prisma.checkoutSession.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: { in: ['pending', 'completed'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { stripeSessionId: true, status: true },
    });

    if (!checkoutSession) {
      console.log('[Checkout/SessionId] Nenhuma sessão encontrada');
      return NextResponse.json(
        { error: 'Nenhuma sessão de checkout encontrada' },
        { status: 404 }
      );
    }

    console.log('[Checkout/SessionId] Sessão encontrada:', {
      stripeSessionId: checkoutSession.stripeSessionId,
      status: checkoutSession.status,
    });

    return NextResponse.json({
      data: {
        sessionId: checkoutSession.stripeSessionId,
        status: checkoutSession.status,
      },
    });
  } catch (error) {
    console.error('[Checkout/SessionId] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessão' },
      { status: 500 }
    );
  }
}
