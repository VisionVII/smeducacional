import { auth } from '@/lib/auth';
import { cancelPlan } from '@/lib/subscription';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/cancel-plan
 * Cancela plano do professor (admin only)
 * Body: { teacherId }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Verificar admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teacherId } = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' },
        { status: 400 }
      );
    }

    const access = await cancelPlan(teacherId);

    return NextResponse.json({
      success: true,
      message: 'Plan cancelled',
      access,
    });
  } catch (error) {
    console.error('Error canceling plan:', error);
    return NextResponse.json(
      { error: 'Failed to cancel plan' },
      { status: 500 }
    );
  }
}
