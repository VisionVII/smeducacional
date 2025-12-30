import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { StudentLayoutWrapper } from '@/components/layouts/student-layout-wrapper';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return (
    <StudentLayoutWrapper
      user={{
        name: session.user.name,
        email: session.user.email || '',
        avatar: (session.user as { image?: string }).image,
      }}
    >
      {children}
    </StudentLayoutWrapper>
  );
}
