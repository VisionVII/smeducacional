import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getRateLimitHeaders,
} from '@/lib/middleware/rate-limit';

/**
 * PATCH /api/notifications/[id]/read
 * Marcar notificação como lida
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(session.user.id, 'notifications');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'read') {
      const notification = await NotificationService.markAsRead(
        id,
        session.user.id
      );
      const response = NextResponse.json(notification);
      Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    } else if (action === 'archive') {
      const notification = await NotificationService.archiveNotification(
        id,
        session.user.id
      );
      const response = NextResponse.json(notification);
      Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[API] Erro ao atualizar notificação:', error);

    if (
      error instanceof Error &&
      error.message === 'Notificação não encontrada'
    ) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Deletar notificação
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(session.user.id, 'notifications');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const { id } = await params;
    await NotificationService.deleteNotification(id, session.user.id);

    const response = NextResponse.json({ success: true });
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error: unknown) {
    console.error('[API] Erro ao deletar notificação:', error);

    if (
      error instanceof Error &&
      error.message === 'Notificação não encontrada'
    ) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar notificação' },
      { status: 500 }
    );
  }
}
