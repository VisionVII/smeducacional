import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

export default async function TeacherDashboard() {
  const session = await auth();
  const user = session!.user;

  // Buscar dados do professor
  const professor = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });

  // Buscar cursos do professor com estatísticas
  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          studentId: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
  });

  // Buscar mensagens não lidas
  const pendingMessages = await prisma.message.count({
    where: {
      receiverId: user.id,
      isRead: false,
    },
  });

  // Buscar dados financeiros do professor
  const payments = await prisma.payment.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED',
    },
    select: {
      id: true,
      amount: true,
      type: true,
      status: true,
      createdAt: true,
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Buscar student subscriptions
  const studentSubscriptions = await prisma.studentSubscription.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      plan: true,
      createdAt: true,
    },
  });

  // Buscar teacher financial info
  await prisma.teacherFinancial.findUnique({
    where: { userId: user.id },
    select: {
      stripeConnectAccountId: true,
      connectOnboardingComplete: true,
    },
  });

  // Calcular totais
  const totalCourseRevenue = payments
    .filter((p) => p.type === 'course')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalSubscriptionRevenue = payments
    .filter((p) => p.type === 'subscription')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalRevenue = totalCourseRevenue + totalSubscriptionRevenue;
  const activeSubscriptions = studentSubscriptions.length;

  // Calcular estatísticas
  const totalStudents = courses.reduce(
    (acc, course) => acc + course._count.enrollments,
    0
  );
  const totalModules = courses.reduce(
    (acc, course) => acc + course._count.modules,
    0
  );
  const totalLessons = courses.reduce(
    (acc, course) =>
      acc +
      course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0),
    0
  );
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;

  // Calcular taxa de conclusão de perfil
  const profileFields = [professor?.name, professor?.email, professor?.avatar];
  const completedFields = profileFields.filter((field) => field).length;
  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // Cursos recentes
  courses.slice(0, 3);

  const stats = {
    totalCourses: courses.length,
    publishedCourses,
    draftCourses,
    totalStudents,
    totalModules,
    totalLessons,
    pendingMessages,
    profileCompletion,
    totalRevenue,
    totalCourseRevenue,
    totalSubscriptionRevenue,
    activeSubscriptions,
    totalPayments: payments.length,
  };

  // Preparar cursos para o client com apenas os dados necessários
  const simplifiedCourses = courses.slice(0, 10).map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    isPublished: course.isPublished,
    _count: {
      modules: course._count.modules,
      lessons: course.modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
      ),
      enrollments: course._count.enrollments,
    },
  }));

  return (
    <DashboardClient
      user={{
        id: professor?.id || user.id,
        name: professor?.name || null,
        email: professor?.email || user.email,
        avatar: professor?.avatar || null,
        createdAt: professor?.createdAt || new Date(),
      }}
      stats={stats}
      courses={simplifiedCourses}
    />
  );
}
