import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TeacherThemeProvider } from '@/components/teacher-theme-provider';
import {
  BookOpen,
  Plus,
  LayoutDashboard,
  Users,
  MessageSquare,
  User,
  Palette,
  DollarSign,
} from 'lucide-react';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const teacherLinks = [
    {
      href: '/teacher/dashboard',
      label: 'Início',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: '/teacher/courses',
      label: 'Meus Cursos',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: '/teacher/courses/new',
      label: 'Novo Curso',
      icon: <Plus className="h-4 w-4" />,
    },
    {
      href: '/teacher/earnings',
      label: 'Ganhos',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      href: '/teacher/messages',
      label: 'Mensagens',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      href: '/teacher/profile',
      label: 'Perfil',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/teacher/theme',
      label: 'Tema',
      icon: <Palette className="h-4 w-4" />,
    },
  ];

  return (
    <TeacherThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar user={session.user} links={teacherLinks} />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </TeacherThemeProvider>
  );
}
