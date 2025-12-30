import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { listFailedNotificationLogs } from '@/lib/email.service';

const querySchema = z.object({
  hours: z.coerce.number().int().min(1).max(72).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { hours, limit } = parsed.data;
  const failures = await listFailedNotificationLogs({
    hours,
    limit,
    criticalOnly: true,
  });

  return NextResponse.json({ failures }, { status: 200 });
}
