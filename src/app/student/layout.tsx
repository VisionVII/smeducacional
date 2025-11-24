import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return <>{children}</>;
}
