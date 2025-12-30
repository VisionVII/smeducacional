import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/student/ai-chat/access
 * Verifica se usuário tem acesso ao Chat IA e retorna cursos matriculados
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Validar autenticação e role
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT' && session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Para TEACHER, pode ser o seu próprio chat ou chat dos alunos
    // Por simplicidade, vamos permitir acesso completo para teacher
    if (session.user.role === 'TEACHER') {
      return NextResponse.json({
        hasAccess: true,
        enrolledCourses: [], // Teachers não têm "courses enrolled"
        isPaid: true,
      });
    }

    // Verificar se estudante tem feature 'ai-assistant' desbloqueada
    const featurePurchase = await prisma.featurePurchase.findUnique({
      where: {
        userId_featureId: {
          userId: session.user.id,
          featureId: 'ai-assistant',
        },
      },
    });

    // Verificar também em assinatura do estudante
    const subscription = await prisma.studentSubscription.findUnique({
      where: { userId: session.user.id },
    });

    const hasFeatureFromSubscription =
      subscription &&
      subscription.status === 'active' &&
      (subscription.plan === 'basic' ||
        subscription.plan === 'premium') &&
      true; // 'ai-assistant' está em basic e premium

    const hasAccess =
      (featurePurchase && featurePurchase.status === 'active') ||
      hasFeatureFromSubscription;

    if (!hasAccess) {
      return NextResponse.json(
        {
          hasAccess: false,
          enrolledCourses: [],
        },
        { status: 200 }
      );
    }

    // Buscar cursos em que estudante está matriculado
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE',
        course: {
          deletedAt: null,
          isPublished: true,
        },
      },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    const enrolledCourses = enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      slug: e.course.slug,
    }));

    return NextResponse.json({
      hasAccess: true,
      enrolledCourses,
      isPaid: !!featurePurchase,
      subscriptionPlan: subscription?.plan,
    });
  } catch (error) {
    console.error('Erro ao verificar acesso ao Chat IA:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar acesso' },
      { status: 500 }
    );
  }
}
