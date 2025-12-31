import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/student/ai-chat/access
 * Verifica se usuário tem acesso ao Chat IA e retorna cursos matriculados
 *
 * LOGS DE DEBUG:
 * Cada falha é registrada com motivo exato
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Validar autenticação e role
    if (!session?.user) {
      console.log('[ChatIA-Access] ❌ Não autenticado');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('[ChatIA-Access] 🔍 Verificando acesso para:', {
      userId,
      role: session.user.role,
    });

    // ADMIN tem acesso total sem restrições
    if (session.user.role === 'ADMIN') {
      console.log('[ChatIA-Access] ✅ ADMIN - acesso total liberado');
      return NextResponse.json({
        hasAccess: true,
        enrolledCourses: [],
        isPaid: true,
        reason: 'admin_access',
      });
    }

    if (session.user.role !== 'STUDENT' && session.user.role !== 'TEACHER') {
      console.log('[ChatIA-Access] ❌ Role não autorizada:', session.user.role);
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Para TEACHER, pode ser o seu próprio chat ou chat dos alunos
    if (session.user.role === 'TEACHER') {
      console.log('[ChatIA-Access] ✅ Teacher - acesso automático');
      return NextResponse.json({
        hasAccess: true,
        enrolledCourses: [],
        isPaid: true,
      });
    }

    // ===== STUDENT: Verificações rigorosas =====
    console.log(
      '[ChatIA-Access] 📋 Verificando feature purchase para student:',
      userId
    );

    // Verificar se estudante tem feature 'ai-assistant' desbloqueada
    const featurePurchase = await prisma.featurePurchase.findUnique({
      where: {
        userId_featureId: {
          userId,
          featureId: 'ai-assistant',
        },
      },
    });

    console.log('[ChatIA-Access] 🔎 FeaturePurchase encontrado:', {
      exists: !!featurePurchase,
      status: featurePurchase?.status,
      purchaseDate: featurePurchase?.purchaseDate,
      stripePaymentId: featurePurchase?.stripePaymentId,
    });

    // Verificar também em assinatura do estudante
    const subscription = await prisma.studentSubscription.findUnique({
      where: { userId },
    });

    console.log('[ChatIA-Access] 📊 Subscription encontrada:', {
      exists: !!subscription,
      status: subscription?.status,
      plan: subscription?.plan,
    });

    const hasFeatureFromSubscription =
      subscription &&
      subscription.status === 'active' &&
      (subscription.plan === 'basic' || subscription.plan === 'premium');

    console.log(
      '[ChatIA-Access] ✓ HasFeatureFromSubscription:',
      hasFeatureFromSubscription
    );

    // DECISÃO FINAL
    const hasFeaturePurchaseActive =
      featurePurchase && featurePurchase.status === 'active';
    const hasAccess = hasFeaturePurchaseActive || hasFeatureFromSubscription;

    console.log('[ChatIA-Access] 🎯 DECISÃO FINAL:', {
      hasFeaturePurchaseActive,
      hasFeatureFromSubscription,
      hasAccess,
    });

    if (!hasAccess) {
      console.log('[ChatIA-Access] ❌ ACESSO NEGADO - Usuário não pago');
      return NextResponse.json(
        {
          hasAccess: false,
          enrolledCourses: [],
          debug: {
            hasFeaturePurchase: !!featurePurchase,
            featurePurchaseStatus: featurePurchase?.status,
            hasSubscription: !!subscription,
            subscriptionStatus: subscription?.status,
          },
        },
        { status: 200 }
      );
    }

    // Buscar cursos em que estudante está matriculado
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
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

    console.log('[ChatIA-Access] ✅ ACESSO CONCEDIDO', {
      userId,
      enrolledCoursesCount: enrolledCourses.length,
      method: hasFeaturePurchaseActive ? 'feature-purchase' : 'subscription',
    });

    return NextResponse.json({
      hasAccess: true,
      enrolledCourses,
      isPaid: !!featurePurchase,
      subscriptionPlan: subscription?.plan,
    });
  } catch (error) {
    console.error('[ChatIA-Access] 💥 ERRO:', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar acesso',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
