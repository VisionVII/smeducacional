'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { PublicNavbar } from '@/components/public-navbar';
import { NavbarThemeProvider } from '@/components/navbar-theme-provider';
import { useSystemBranding } from '@/hooks/use-system-branding';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  MessageSquare,
  Bell,
  ClipboardList,
  GraduationCap,
  Users,
  FolderTree,
  DollarSign,
  Palette,
} from 'lucide-react';

/**
 * Componente de navegação adaptativa que mostra:
 * - Menu completo (Navbar) para usuários logados (STUDENT, TEACHER, ADMIN)
 * - Menu simples (PublicNavbar) para usuários não autenticados
 *
 * Uso: Substituir headers manuais nas páginas públicas por este componente
 */
export function AdaptiveNavbar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { branding } = useSystemBranding();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante carregamento inicial, não renderiza nada para evitar flash
  if (!mounted || status === 'loading') {
    return null;
  }

  // Se usuário está logado, mostra menu completo baseado no role
  if (session?.user) {
    const userRole = (session.user as any).role;
    let links: any[] = [];

    switch (userRole) {
      case 'STUDENT':
        links = [
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
        break;

      case 'TEACHER':
        links = [
          {
            href: '/teacher/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            href: '/teacher/courses',
            label: 'Meus Cursos',
            icon: <BookOpen className="h-4 w-4" />,
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
            href: '/teacher/theme',
            label: 'Personalização',
            icon: <Palette className="h-4 w-4" />,
          },
          {
            href: '/teacher/profile',
            label: 'Perfil',
            icon: <User className="h-4 w-4" />,
          },
        ];
        break;

      case 'ADMIN':
        links = [
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
            href: '/admin/categories',
            label: 'Categorias',
            icon: <FolderTree className="h-4 w-4" />,
          },
          {
            href: '/admin/profile',
            label: 'Perfil',
            icon: <User className="h-4 w-4" />,
          },
        ];
        break;
    }

    return (
      <NavbarThemeProvider>
        <Navbar
          user={{
            name: session.user.name || 'Usuário',
            email: session.user.email || '',
            role: userRole,
            avatar: (session.user as any).avatar || null,
          }}
          links={links}
        />
      </NavbarThemeProvider>
    );
  }

  // Se não está logado, mostra menu público simples
  return <PublicNavbar />;
}
