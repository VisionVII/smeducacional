import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TeacherLayoutWrapper } from '@/components/layouts/teacher-layout-wrapper';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  return (
    <TeacherLayoutWrapper
      user={{
        name: session.user.name,
        email: session.user.email || '',
        avatar: (session.user as { image?: string }).image,
      }}
    >
      {children}
    </TeacherLayoutWrapper>
  );
}
