import { auth } from '@/lib/auth';
import { activatePlan } from '@/lib/subscription';
import { NextResponse } from 'next/server';
import type { PlanType } from '@/lib/subscription';

/**
 * POST /api/admin/activate-plan
 * Ativa plano para professor (admin only)
 * Body: { teacherId, plan, durationDays }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Verificar admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teacherId, plan, durationDays } = await request.json();

    if (!teacherId || !plan || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const access = await activatePlan(
      teacherId,
      plan as PlanType,
      durationDays
    );

    return NextResponse.json({
      success: true,
      message: `Plan ${plan} activated for ${durationDays} days`,
      access,
    });
  } catch (error) {
    console.error('Error activating plan:', error);
    return NextResponse.json(
      { error: 'Failed to activate plan' },
      { status: 500 }
    );
  }
}
