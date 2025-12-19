import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen, Settings, FileText } from 'lucide-react';
import Link from 'next/link';

export function QuickActionsPanel() {
  const actions = [
    {
      label: 'Novo Curso',
      href: '/admin/courses/create',
      icon: Plus,
      color: 'text-blue-600',
    },
    {
      label: 'Gerenciar Usuários',
      href: '/admin/users',
      icon: Users,
      color: 'text-green-600',
    },
    {
      label: 'Ver Cursos',
      href: '/admin/courses',
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      label: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-amber-600',
    },
    {
      label: 'Relatórios',
      href: '/admin/analytics',
      icon: FileText,
      color: 'text-red-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                asChild
                variant="outline"
                className="justify-start h-auto py-3"
              >
                <Link href={action.href}>
                  <Icon className={`h-4 w-4 mr-2 ${action.color}`} />
                  <span className="text-sm">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
