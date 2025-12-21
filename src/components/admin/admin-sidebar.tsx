'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Settings,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: Array<{
    title: string;
    href: string;
  }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
    children: [
      { title: 'Todos os Usuários', href: '/admin/users' },
      { title: 'Alunos', href: '/admin/users?role=STUDENT' },
      { title: 'Professores', href: '/admin/users?role=TEACHER' },
      { title: 'Administradores', href: '/admin/users?role=ADMIN' },
    ],
  },
  {
    title: 'Cursos',
    href: '/admin/courses',
    icon: BookOpen,
    children: [
      { title: 'Todos os Cursos', href: '/admin/courses' },
      { title: 'Novo Curso', href: '/admin/courses/create' },
      { title: 'Categorias', href: '/admin/courses/categories' },
    ],
  },
  {
    title: 'Matrículas',
    href: '/admin/enrollments',
    icon: GraduationCap,
  },
  {
    title: 'Financeiro',
    href: '/admin/payments',
    icon: DollarSign,
    children: [
      { title: 'Pagamentos', href: '/admin/payments' },
      { title: 'Assinaturas', href: '/admin/subscriptions' },
      { title: 'Relatório Fiscal', href: '/admin/financial-reports' },
    ],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Mensagens',
    href: '/admin/messages',
    icon: MessageSquare,
    badge: '3',
  },
  {
    title: 'Notificações',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Relatórios',
    href: '/admin/reports',
    icon: FileText,
    children: [
      { title: 'Relatório Geral', href: '/admin/reports' },
      { title: 'Relatório de Acessos', href: '/admin/reports/access' },
      {
        title: 'Relatório de Certificados',
        href: '/admin/reports/certificates',
      },
    ],
  },
  {
    title: 'Segurança',
    href: '/admin/security',
    icon: Shield,
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="space-y-2 p-4">
        {navItems?.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openItems.includes(item.title);

          if (hasChildren) {
            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleItem(item.title)}
              >
                <CollapsibleTrigger
                  className={cn(
                    'flex items-center justify-between w-full gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isOpen && 'rotate-90'
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-11 pr-3 pt-2 space-y-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname === child.href &&
                          'bg-accent text-accent-foreground font-medium'
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
