import { auth } from '@/lib/auth';
import { getTeacherAccessControl } from '@/lib/subscription';
import { NextResponse } from 'next/server';

/**
 * GET /api/teacher/access-control
 * Retorna status completo de acesso do professor autenticado
 * Usado pelo hook useCanAccess para verificar features disponíveis
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Não autenticado = retorna free plan
    if (!session?.user?.id) {
      return NextResponse.json({
        isActive: false,
        isTrial: false,
        isExpired: false,
        plan: 'free',
        subscriptionStatus: 'inactive',
        maxStudents: 10,
        maxStorageGB: 1,
        canUploadLogo: false,
        canCustomizeDomain: false,
        canAccessAnalytics: false,
        canUploadVideos: true,
        canCreateCourses: true,
        canManagePayments: false,
        subscriptionExpiresAt: null,
        trialEndsAt: null,
        daysUntilExpiry: null,
      });
    }

    const access = await getTeacherAccessControl(session.user.id);
    return NextResponse.json(access);
  } catch (error) {
    console.error('Error fetching access control:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access control' },
      { status: 500 }
    );
  }
}
