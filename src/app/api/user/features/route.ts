import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserFeatures } from '@/lib/services/user.service';

/**
 * Simple in-memory rate limiter for feature access checks.
 * In production, use @upstash/ratelimit with Redis backend for multi-instance support.
 *
 * Structure: Map<userId, { count: number; resetAt: number }>
 */
const featureAccessLimiter = new Map<
  string,
  { count: number; resetAt: number }
>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute
const CLEANUP_INTERVAL_MS = 5 * 60_000; // Cleanup expired entries every 5 minutes

/**
 * Start automatic cleanup of expired rate limit entries.
 * Prevents memory leak in long-running processes.
 */
if (typeof global !== 'undefined' && !global._rateLimitCleanupStarted) {
  global._rateLimitCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [userId, data] of featureAccessLimiter.entries()) {
      if (now >= data.resetAt) {
        featureAccessLimiter.delete(userId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.debug(`[RateLimit] Cleaned up ${cleaned} expired entries`);
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Check and update rate limit for user.
 * Fixed: Increment count BEFORE comparison to prevent race condition.
 * Returns true if request allowed, false if rate limit exceeded.
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  let current = featureAccessLimiter.get(userId);

  if (!current || now >= current.resetAt) {
    // Window expired or first request; reset counter
    featureAccessLimiter.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  // Increment count FIRST, then check limit (atomic-like behavior)
  current.count++;

  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    // Exceeded; decrement to keep accurate count
    current.count--;
    return false;
  }

  return true;
}

export async function GET(request: Request) {
  let success = false;
  let statusCode = 500;

  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.role) {
      statusCode = 401;
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    // Rate limit check: 30 requests per minute per user
    if (!checkRateLimit(userId)) {
      statusCode = 429;
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    const features = await getUserFeatures(
      userId,
      role as 'ADMIN' | 'TEACHER' | 'STUDENT'
    );

    success = true;
    statusCode = 200;

    // TODO: Log access via AuditService when implemented
    // try {
    //   await AuditService.logAuditTrail({
    //     userId,
    //     action: 'FEATURE_ACCESS_CHECK',
    //     resourceId: null,
    //     changes: { accessedFeatures: features.length },
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    //     status: 'success',
    //   });
    // } catch (auditError) {
    //   console.error('[Audit] Failed to log feature access:', auditError);
    //   // Don't block request if audit fails
    // }

    return NextResponse.json({ data: features });
  } catch (error) {
    console.error('[GET /api/user/features] Erro:', error);
    statusCode = 500;
    return NextResponse.json(
      { error: 'Erro ao buscar features' },
      { status: 500 }
    );
  }
}
