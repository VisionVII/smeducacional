import { prisma } from '@/lib/db';
import { AuditAction } from '@/lib/audit.service';
import type { Prisma } from '@prisma/client';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function getAdminDashboardData() {
  const now = Date.now();
  const twentyFourHoursAgo = new Date(now - DAY_IN_MS);
  const sevenDaysAgo = new Date(now - 7 * DAY_IN_MS);
  const thirtyDaysAgo = new Date(now - 30 * DAY_IN_MS);

  const [
    userCount,
    courseCount,
    enrollmentCount,
    revenueAgg,
    newUsers24h,
    newEnrollments7d,
    pendingCourses,
    suspiciousLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.enrollment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.enrollment.count({
      where: {
        enrolledAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.course.findMany({
      where: { isPublished: false, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        createdAt: true,
        instructor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            AuditAction.USER_BANNED,
            AuditAction.ADMIN_IMPERSONATION,
            AuditAction.ROLE_PERMISSION_CHANGED,
            AuditAction.PAYMENT_REFUNDED,
            AuditAction.PAYOUT_GENERATED,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        action: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        metadata: true,
        targetId: true,
        targetType: true,
      },
    }),
  ]);

  const stats = {
    totalUsers: userCount,
    totalCourses: courseCount,
    totalEnrollments: enrollmentCount,
    totalRevenue: revenueAgg._sum.amount || 0,
    newUsersLast24Hours: newUsers24h,
    newEnrollmentsLast7Days: newEnrollments7d,
    newUsersLast30Days: await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  };

  const systemStatus = [
    { name: 'API', status: 'operational' as const, latencyMs: 120 },
    { name: 'Banco de Dados', status: 'operational' as const, latencyMs: 95 },
    { name: 'Storage', status: 'operational' as const, latencyMs: 140 },
  ];

  const formattedSuspicious = suspiciousLogs.map((log) => ({
    id: log.id,
    action: log.action,
    createdAt: log.createdAt,
    user: log.user,
    targetId: log.targetId,
    targetType: log.targetType,
    metadata: log.metadata as Prisma.InputJsonValue | undefined,
  }));

  const approvals = pendingCourses.map((course) => ({
    id: course.id,
    title: course.title,
    createdAt: course.createdAt,
    instructor: course.instructor,
  }));

  return {
    stats,
    systemStatus,
    suspiciousActivities: formattedSuspicious,
    pendingCourses: approvals,
  };
}

export async function getTeacherDashboardData(
  userId: string,
  opts?: { courseLimit?: number }
) {
  const courseLimit =
    opts?.courseLimit && opts.courseLimit > 0 ? opts.courseLimit : 6;

  const [teacher, courses, pendingMessages, payments, activeSubscriptions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      }),
      prisma.course.findMany({
        where: { instructorId: userId, deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          createdAt: true,
          modules: {
            select: {
              id: true,
              lessons: { select: { id: true } },
            },
          },
          enrollments: { select: { id: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.max(courseLimit, 6),
      }),
      prisma.message.count({ where: { receiverId: userId, isRead: false } }),
      prisma.payment.findMany({
        where: { userId, status: 'COMPLETED' },
        select: {
          id: true,
          amount: true,
          type: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentSubscription.count({ where: { status: 'ACTIVE' } }),
    ]);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalStudents = courses.reduce(
    (acc, c) => acc + c._count.enrollments,
    0
  );
  const totalModules = courses.reduce((acc, c) => acc + c._count.modules, 0);
  const totalLessons = courses.reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );

  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.length - publishedCourses;

  const profileFields = [teacher?.name, teacher?.email, teacher?.avatar];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  const simplifiedCourses = courses.slice(0, courseLimit).map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    isPublished: course.isPublished,
    createdAt: course.createdAt,
    modules: course.modules.length,
    lessons: course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0),
    enrollments: course._count.enrollments,
  }));

  const engagementSeries = payments
    .slice(0, 10)
    .map((p) => ({
      label: p.createdAt.toISOString(),
      value: Math.max(p.amount || 0, 0),
    }));

  return {
    profile: teacher,
    stats: {
      totalCourses: courses.length,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalModules,
      totalLessons,
      pendingMessages,
      profileCompletion,
      totalRevenue,
      activeSubscriptions,
    },
    courses: simplifiedCourses,
    engagementSeries,
  };
}

export async function getStudentDashboardData(
  userId: string,
  opts?: { courseLimit?: number }
) {
  const courseLimit =
    opts?.courseLimit && opts.courseLimit > 0 ? opts.courseLimit : 6;

  const [enrollments, certificateCount] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            slug: true,
            isPublished: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      take: courseLimit,
    }),
    prisma.certificate.count({ where: { studentId: userId } }),
  ]);

  const stats = {
    activeCourses: enrollments.filter((e) => e.status === 'ACTIVE').length,
    completedCourses: enrollments.filter((e) => e.status === 'COMPLETED')
      .length,
    certificates: certificateCount,
    totalHours: 0,
  };

  const continueLearning = enrollments.map((enrollment) => ({
    id: enrollment.id,
    courseId: enrollment.course.id,
    title: enrollment.course.title,
    description: enrollment.course.description,
    progress: enrollment.progress || 0,
    thumbnail: enrollment.course.thumbnail,
    slug: enrollment.course.slug,
  }));

  return { stats, continueLearning };
}
