import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { LayoutDashboard, Users, BookOpen, Settings, BarChart3 } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const adminLinks = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: '/admin/users',
      label: 'Usuários',
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: '/admin/courses',
      label: 'Cursos',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: '/admin/reports',
      label: 'Relatórios',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      href: '/admin/settings',
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user} links={adminLinks} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
