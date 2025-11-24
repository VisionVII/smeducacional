import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    redirect('/login');
  }

  return <>{children}</>;
}
