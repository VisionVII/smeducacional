import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  checkRateLimit,
  getRateLimitHeaders,
} from '@/lib/middleware/rate-limit';

const preferencesSchema = z.object({
  emailSecurityAlerts: z.boolean().optional(),
  emailEnrollments: z.boolean().optional(),
  emailPayments: z.boolean().optional(),
  emailReviews: z.boolean().optional(),
  emailCourseUpdates: z.boolean().optional(),
  emailReminders: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  inSystemNotifications: z.boolean().optional(),
  inSystemSound: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  quietHoursTimezone: z.string().optional(),
});

/**
 * GET /api/notifications/preferences
 * Buscar preferências de notificação do usuário
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit (less restrictive for preferences)
    const rateLimit = checkRateLimit(session.user.id, 'preferences');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const preferences = await NotificationService.updatePreferences(
      session.user.id,
      {}
    );
    const response = NextResponse.json(preferences);
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[API] Erro ao buscar preferências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar preferências' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Atualizar preferências de notificação
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(session.user.id, 'preferences');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const body = await request.json();
    const validated = preferencesSchema.parse(body);

    const preferences = await NotificationService.updatePreferences(
      session.user.id,
      validated
    );

    const response = NextResponse.json(preferences);
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[API] Erro ao atualizar preferências:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}
