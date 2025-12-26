'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  courses: 'Cursos',
  students: 'Alunos',
  teachers: 'Professores',
  users: 'Usuários',
  settings: 'Configurações',
  profile: 'Perfil',
  new: 'Novo',
  edit: 'Editar',
  content: 'Conteúdo',
  student: 'Área do Aluno',
  teacher: 'Área do Professor',
  admin: 'Administração',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Não mostrar breadcrumbs em páginas públicas
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Se for apenas dashboard sem prefixo, não mostrar
  if (segments.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    // Ignorar segmentos dinâmicos do tipo [slug], [id], etc.
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return;
    }
    currentPath += `/${segment}`;

    // Não adicionar IDs de curso/módulo/lição aos breadcrumbs
    const isId = /^[a-f0-9-]{36}$|^\d+$/.test(segment);

    if (!isId) {
      const label =
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  });

  // Se não tiver breadcrumbs suficientes, não mostrar
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 py-2">
      <Link
        href="/"
        className="hover:text-foreground transition-colors flex items-center"
        suppressHydrationWarning
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs?.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Fragment key={crumb.href}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors"
                suppressHydrationWarning
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
