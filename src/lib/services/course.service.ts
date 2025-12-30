import { prisma } from '@/lib/db';
import { getSignedUrl } from './video.service';
import { logAuditTrail, AuditAction } from '@/lib/audit.service';
import type { Prisma, Course, Lesson } from '@prisma/client';

export type UserContext = {
  id: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
};

type CreateCourseInput = {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  duration?: number | null;
  level?: string | null;
  price?: number | null;
  isPaid?: boolean;
  isPublished?: boolean;
  requirements?: string | null;
  whatYouLearn?: string | null;
  categoryId: string;
  compareAtPrice?: number | null;
};

type ListCoursesFilters = {
  categoryId?: string | null;
  instructorId?: string | null;
  isPublished?: boolean | null;
  search?: string | null;
};

export async function listCourses(filters: ListCoursesFilters) {
  const where: Prisma.CourseWhereInput = {};
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.instructorId) where.instructorId = filters.instructorId;
  if (filters.isPublished !== null && filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, email: true, avatar: true, bio: true },
      },
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return courses.map((c) => ({
    ...c,
    isPaid: typeof c.price === 'number' ? c.price > 0 : Boolean(c.isPaid),
  }));
}

export async function createCourse(
  data: CreateCourseInput,
  instructorId: string
) {
  const normalizedIsPaid =
    typeof data.isPaid === 'boolean'
      ? data.isPaid
      : typeof data.price === 'number'
      ? data.price > 0
      : undefined;

  return prisma.course.create({
    data: {
      ...data,
      instructorId,
      isPaid: normalizedIsPaid,
      isPublished:
        typeof data.isPublished === 'boolean' ? data.isPublished : undefined,
    },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, email: true, avatar: true, bio: true },
      },
    },
  });
}

export async function findCourseBySlug(slug: string) {
  return prisma.course.findUnique({ where: { slug } });
}

export async function findCategoryById(categoryId: string) {
  return prisma.category.findUnique({ where: { id: categoryId } });
}

export async function getCourseForEdit(courseId: string) {
  return prisma.course.findUnique({ where: { id: courseId, deletedAt: null } });
}

export async function updateCourse(
  courseId: string,
  data: Record<string, unknown>
) {
  return prisma.course.update({
    where: { id: courseId },
    data,
  });
}

export async function listTeacherCourses(params: {
  instructorId: string;
  search?: string;
  status?: 'PUBLISHED' | 'DRAFT' | null;
  category?: string | null;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.CourseWhereInput = { instructorId: params.instructorId };
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.status === 'PUBLISHED') where.isPublished = true;
  if (params.status === 'DRAFT') where.isPublished = false;
  if (params.category) where.categoryId = params.category;

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        categoryId: true,
        level: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  const data = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    thumbnail: c.thumbnail,
    categoryId: c.categoryId || null,
    level: c.level || 'BEGINNER',
    status: c.isPublished ? 'PUBLISHED' : 'DRAFT',
    moduleCount: c._count.modules,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return { data, total };
}

export async function listTeacherCoursesWithCounts(params: {
  instructorId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: 'PUBLISHED' | 'DRAFT' | null;
  category?: string | null;
}) {
  const where: Prisma.CourseWhereInput = {
    instructorId: params.instructorId,
    deletedAt: null,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.status === 'PUBLISHED') where.isPublished = true;
  if (params.status === 'DRAFT') where.isPublished = false;

  if (params.category) {
    where.categoryId = params.category;
  }

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        isPublished: true,
        price: true,
        compareAtPrice: true,
        level: true,
        modules: {
          where: { deletedAt: null },
          select: { _count: { select: { lessons: true } } },
        },
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  const data = courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnail: course.thumbnail,
    isPublished: course.isPublished,
    price: course.price,
    compareAtPrice: course.compareAtPrice,
    level: course.level,
    _count: {
      modules: course._count.modules,
      enrollments: course._count.enrollments,
    },
    lessonCount: course.modules.reduce(
      (acc, module) => acc + module._count.lessons,
      0
    ),
  }));

  return { data, total };
}

export async function getTeacherCourseStats(instructorId: string) {
  const where: Prisma.CourseWhereInput = {
    instructorId,
    deletedAt: null,
  };

  const [totalCourses, publishedCourses, draftCourses, totalStudents] =
    await Promise.all([
      prisma.course.count({ where }),
      prisma.course.count({ where: { ...where, isPublished: true } }),
      prisma.course.count({ where: { ...where, isPublished: false } }),
      prisma.enrollment.count({
        where: { course: { instructorId, deletedAt: null } },
      }),
    ]);

  return { totalCourses, publishedCourses, draftCourses, totalStudents };
}

export async function createTeacherCourse(input: {
  title: string;
  description: string;
  categoryId: string;
  level?: string | null;
  thumbnail?: string | null;
  instructorId: string;
  slug: string;
}) {
  return prisma.course.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      level: input.level || undefined,
      thumbnail: input.thumbnail || undefined,
      isPublished: false,
      instructorId: input.instructorId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      categoryId: true,
      level: true,
      isPublished: true,
    },
  });
}

type CourseAccessPayload = Pick<Course, 'id' | 'instructorId' | 'isPublished'>;
type LessonWithSignedUrl = Lesson & { signedVideoUrl?: string | null };

async function ensureAccess(
  course: CourseAccessPayload,
  user: UserContext | null
) {
  const isAdmin = user?.role === 'ADMIN';
  const isOwner =
    user && user.role === 'TEACHER' && user.id === course.instructorId;
  const isPublished = course.isPublished;

  if (isAdmin || isOwner) return true;

  if (!user) return false;

  if (!isPublished) return false;

  if (user.role === 'STUDENT') {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: course.id,
        },
      },
      select: { status: true },
    });
    return enrollment?.status === 'ACTIVE';
  }

  return false;
}

export async function getCourseDetails(
  courseId: string,
  user: UserContext | null
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, email: true, avatar: true, bio: true },
      },
      modules: {
        where: { deletedAt: null },
        include: {
          lessons: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return { error: 'NOT_FOUND' as const };

  const hasAccess = await ensureAccess(course, user);
  if (!hasAccess) return { error: 'FORBIDDEN' as const };

  const lessonsToSign = course.modules.flatMap((m) => m.lessons);

  await Promise.all(
    lessonsToSign.map(async (lesson) => {
      if (!lesson.videoUrl) return;
      const signedUrl = await getSignedUrl(lesson.videoUrl);
      if (signedUrl) {
        const lessonWithSignedUrl = lesson as LessonWithSignedUrl;
        lessonWithSignedUrl.signedVideoUrl = signedUrl;
        // Registrar auditoria apenas para alunos
        if (user?.role === 'STUDENT') {
          await logAuditTrail({
            userId: user.id,
            action: AuditAction.CONTENT_ACCESS,
            targetId: lesson.id,
            targetType: 'Lesson',
            metadata: {
              courseId: course.id,
              moduleId: lesson.moduleId,
              path: lesson.videoUrl,
            },
          });
        }
      }
    })
  );

  return { course };
}
