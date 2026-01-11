/**
 * Rate Limiting Middleware para APIs de notificações
 * Segurança contra DoS e abuso
 */

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS = {
  notifications: { requests: 100, window: 60 * 1000 }, // 100 req/min
  preferences: { requests: 20, window: 60 * 1000 }, // 20 req/min
  unreadCount: { requests: 300, window: 60 * 1000 }, // 300 req/min
};

export function checkRateLimit(
  userId: string,
  endpoint: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = RATE_LIMITS[endpoint];
  const key = `${userId}:${endpoint}`;
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    // Nova janela
    requestCounts.set(key, { count: 1, resetAt: now + limit.window });
    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetIn: limit.window,
    };
  }

  if (record.count >= limit.requests) {
    // Limite atingido
    const resetIn = record.resetAt - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  // Incrementar contador
  record.count++;
  return {
    allowed: true,
    remaining: limit.requests - record.count,
    resetIn: record.resetAt - now,
  };
}

export function getRateLimitHeaders(rateLimitResult: {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}) {
  return {
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
  };
}
