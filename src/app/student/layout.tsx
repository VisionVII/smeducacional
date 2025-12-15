import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { StudentThemeProvider } from '@/components/student-theme-provider';
import {
  BookOpen,
  Award,
  LayoutDashboard,
  GraduationCap,
  User,
  MessageSquare,
  Bell,
  ClipboardList,
} from 'lucide-react';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  const studentLinks = [
    {
      href: '/student/dashboard',
      label: 'Início',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: '/student/courses',
      label: 'Meus Cursos',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: '/student/activities',
      label: 'Atividades',
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      href: '/student/certificates',
      label: 'Certificados',
      icon: <Award className="h-4 w-4" />,
    },
    {
      href: '/student/messages',
      label: 'Mensagens',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      href: '/student/notifications',
      label: 'Notificações',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      href: '/student/profile',
      label: 'Perfil',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/courses',
      label: 'Catálogo',
      icon: <GraduationCap className="h-4 w-4" />,
    },
  ];

  return (
    <StudentThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar user={session.user} links={studentLinks} />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </StudentThemeProvider>
  );
}
