import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { listAuditLogs, AuditAction } from '@/lib/audit.service';

const querySchema = z.object({
  action: z.nativeEnum(AuditAction).optional(),
  userId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { action, userId, page, pageSize } = parsed.data;

  const result = await listAuditLogs({ action, userId, page, pageSize });

  return NextResponse.json(result, { status: 200 });
}
