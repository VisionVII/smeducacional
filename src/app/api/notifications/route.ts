import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getRateLimitHeaders,
} from '@/lib/middleware/rate-limit';

/**
 * GET /api/notifications
 * Buscar notificações do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(session.user.id, 'notifications');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            'Limite de requisições atingido. Tente novamente em alguns segundos.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    const result = await NotificationService.getUserNotifications(
      session.user.id,
      {
        limit,
        offset,
        isRead:
          isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        type: type as unknown as any,
      }
    );

    const response = NextResponse.json(result);
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[API] Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/mark-all-read
 * Marcar todas as notificações como lidas
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(session.user.id, 'notifications');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            'Limite de requisições atingido. Tente novamente em alguns segundos.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'markAllRead') {
      await NotificationService.markAllAsRead(session.user.id);
      const response = NextResponse.json({ success: true });
      Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('[API] Erro ao marcar como lida:', error);
    return NextResponse.json(
      { error: 'Erro ao processar ação' },
      { status: 500 }
    );
  }
}
