import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BookOpen, Award, LayoutDashboard, GraduationCap } from 'lucide-react';

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
      href: '/student/certificates',
      label: 'Certificados',
      icon: <Award className="h-4 w-4" />,
    },
    {
      href: '/courses',
      label: 'Catálogo',
      icon: <GraduationCap className="h-4 w-4" />,
    },
  ];

  return (
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
  );
}
