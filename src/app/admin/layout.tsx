import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminLayoutWrapper } from '@/components/layouts/admin-layout-wrapper';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <AdminLayoutWrapper
      user={{
        name: session.user.name,
        email: session.user.email || '',
        avatar: (session.user as { image?: string }).image,
      }}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
