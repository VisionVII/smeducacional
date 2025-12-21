import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  Settings,
  Palette,
} from 'lucide-react';

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
      href: '/admin',
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
      href: '/admin/categories',
      label: 'Categorias',
      icon: <FolderTree className="h-4 w-4" />,
    },
    {
      href: '/admin/ai-assistant',
      label: 'Assistente IA',
      icon: <span className="h-4 w-4">🤖</span>,
    },
    {
      href: '/admin/settings/theme',
      label: 'Tema',
      icon: <Palette className="h-4 w-4" />,
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
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
