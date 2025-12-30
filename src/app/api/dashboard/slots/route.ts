import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserFeatures } from '@/lib/services/user.service';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

type SlotNavItem = {
  href: string;
  label: string;
  featureId?: string;
  locked?: boolean;
  upsellHref?: string;
};

/**
 * Default slot navigation items (premium features)
 * Each slot is tied to a feature ID that must be validated server-side
 */
const defaultSlotNav: Record<Role, SlotNavItem[]> = {
  ADMIN: [
    {
      href: '/admin/ai-assistant',
      label: 'IA Assistente',
      featureId: 'ai-assistant',
    },
    {
      href: '/admin/mentorships',
      label: 'Mentorias',
      featureId: 'mentorships',
    },
    { href: '/admin/pro-tools', label: 'Pro Tools', featureId: 'pro-tools' },
  ],
  TEACHER: [
    {
      href: '/teacher/ai-assistant',
      label: 'Chat IA',
      featureId: 'ai-assistant',
    },
    {
      href: '/teacher/mentorships',
      label: 'Mentorias',
      featureId: 'mentorships',
    },
    {
      href: '/teacher/pro-tools',
      label: 'Pro Tools',
      featureId: 'pro-tools',
    },
  ],
  STUDENT: [
    {
      href: '/student/ai-assistant',
      label: 'Chat IA',
      featureId: 'ai-assistant',
    },
    {
      href: '/student/mentorships',
      label: 'Mentorias',
      featureId: 'mentorships',
    },
    {
      href: '/student/pro-tools',
      label: 'Pro Tools',
      featureId: 'pro-tools',
    },
  ],
};

/**
 * Shared rate limiter for slot checks (same as /api/user/features).
 * Prevents scraping without authentication overhead.
 */
const slotAccessLimiter = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute
const CLEANUP_INTERVAL_MS = 5 * 60_000; // Cleanup every 5 minutes

/**
 * Start automatic cleanup of expired rate limit entries.
 */
if (typeof global !== 'undefined' && !global._slotLimitCleanupStarted) {
  global._slotLimitCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [userId, data] of slotAccessLimiter.entries()) {
      if (now >= data.resetAt) {
        slotAccessLimiter.delete(userId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.debug(`[SlotRateLimit] Cleaned up ${cleaned} expired entries`);
    }
  }, CLEANUP_INTERVAL_MS);
}

function checkSlotRateLimit(userId: string): boolean {
  const now = Date.now();
  let current = slotAccessLimiter.get(userId);

  if (!current || now >= current.resetAt) {
    slotAccessLimiter.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  current.count++;
  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    current.count--;
    return false;
  }

  return true;
}

/**
 * GET /api/dashboard/slots
 *
 * Server-side validation of slot navigation.
 * Returns only unlocked slots for authenticated user.
 * Prevents client-side feature spoofing.
 *
 * Response format:
 * {
 *   "slots": [
 *     { "href": "/teacher/ai-assistant", "label": "Chat IA" },
 *     // Only unlocked slots returned; locked slots never sent to client
 *   ],
 *   "role": "TEACHER"
 * }
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limit check (same limits as /api/user/features)
    if (!checkSlotRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    const role = session.user.role as Role;

    // Fetch user's accessible features server-side
    const accessibleFeatures = await getUserFeatures(userId, role);

    // Get base slots for role
    const baseSlots = defaultSlotNav[role] || [];

    // Filter: only return unlocked slots to client
    // Locked slots are never sent (prevents UI spoofing)
    const unlockedSlots = baseSlots.filter((slot) => {
      if (!slot.featureId) return true; // Slots without featureId always visible
      return accessibleFeatures.includes(slot.featureId as never);
    });

    // Remove featureId from response (internal implementation detail)
    const sanitizedSlots = unlockedSlots.map(
      ({ featureId: _, ...rest }) => rest
    );

    // TODO: Log access via AuditService when implemented
    // try {
    //   await AuditService.logAuditTrail({
    //     userId,
    //     action: 'SLOT_ACCESS_CHECK',
    //     resourceId: null,
    //     changes: { returnedSlots: sanitizedSlots.length },
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    //     status: 'success',
    //   });
    // } catch (auditError) {
    //   console.error('[Audit] Failed to log slot access:', auditError);
    //   // Don't block request if audit fails
    // }

    return NextResponse.json({
      slots: sanitizedSlots,
      role,
    });
  } catch (error) {
    console.error('[GET /api/dashboard/slots] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar slots' },
      { status: 500 }
    );
  }
}
