import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/teachers-billing
 * Retorna lista de todos os professores com status de plano
 * Requer: Role ADMIN
 */
export async function GET() {
  try {
    const session = await auth();

    // Verificar admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        email: true,
        name: true,
        teacherFinancial: {
          select: {
            plan: true,
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
            trialEndsAt: true,
            canUploadLogo: true,
            canCustomizeDomain: true,
            canAccessAnalytics: true,
            maxStudents: true,
            maxStorage: true,
          },
        },
      },
    });

    const result = teachers.map((teacher) => ({
      userId: teacher.id,
      userName: teacher.name,
      userEmail: teacher.email,
      plan: teacher.teacherFinancial?.plan || 'free',
      subscriptionStatus:
        teacher.teacherFinancial?.subscriptionStatus || 'inactive',
      subscriptionExpiresAt: teacher.teacherFinancial?.subscriptionExpiresAt,
      trialEndsAt: teacher.teacherFinancial?.trialEndsAt,
      canUploadLogo: teacher.teacherFinancial?.canUploadLogo || false,
      canCustomizeDomain: teacher.teacherFinancial?.canCustomizeDomain || false,
      canAccessAnalytics: teacher.teacherFinancial?.canAccessAnalytics || false,
      maxStudents: teacher.teacherFinancial?.maxStudents || 10,
      maxStorageGB: Math.floor(
        (teacher.teacherFinancial?.maxStorage || 1024) / 1024
      ),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching teachers billing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}
