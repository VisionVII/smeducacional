import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getRateLimitHeaders,
} from '@/lib/middleware/rate-limit';

/**
 * GET /api/notifications/unread-count
 * Contar notificações não lidas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit (very permissive for unread count)
    const rateLimit = checkRateLimit(session.user.id, 'unreadCount');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const unreadCount = await NotificationService.getUnreadCount(
      session.user.id
    );

    const response = NextResponse.json({ unreadCount });
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[API] Erro ao contar notificações não lidas:', error);
    return NextResponse.json(
      { error: 'Erro ao contar notificações' },
      { status: 500 }
    );
  }
}
