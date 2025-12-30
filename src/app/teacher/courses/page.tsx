import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CoursesClientWrapper } from '@/components/teacher/courses-client-wrapper';
import {
  getTeacherCourseStats,
  listTeacherCoursesWithCounts,
} from '@/lib/services/course.service';

const PAGE_SIZE = 3;

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const [coursePage, stats] = await Promise.all([
    listTeacherCoursesWithCounts({
      instructorId: session.user.id,
      page: 1,
      pageSize: PAGE_SIZE,
    }),
    getTeacherCourseStats(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <CoursesClientWrapper
          courses={coursePage.data}
          stats={stats}
          pageSize={PAGE_SIZE}
          totalCoursesCount={coursePage.total}
        />
      </div>
    </div>
  );
}
