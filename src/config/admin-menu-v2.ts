/**
 * ADMIN MENU CONFIGURATION v2
 * Single source of truth para toda navegação admin
 * Governance: VisionVII 3.0 Enterprise
 *
 * TODO:
 * - [ ] Adicionar rota de Chat IA quando disponível
 * - [ ] Consolidar Mentorias no menu quando Feature completa
 * - [ ] Adicionar Feature Flags para controle de acesso
 */

import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  GraduationCap,
  DollarSign,
  BarChart3,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  Sparkles,
  Lock,
  Menu,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  href?: string; // Optional para parent items
  label: string;
  icon: React.ElementType;
  badge?: string | number | 'dynamic'; // 'dynamic' = fetch count
  children?: MenuItem[];
}

export interface SlotNavItem extends MenuItem {
  locked?: boolean;
  featureId?: string;
  upsellHref?: string;
}

/**
 * MAIN NAVIGATION
 * Menu principal da sidebar admin
 * Usado em: admin-sidebar.tsx
 */
export const ADMIN_MAIN_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'users',
    href: '/admin/users',
    label: 'Usuários',
    icon: Users,
    children: [
      {
        id: 'users-all',
        href: '/admin/users',
        label: 'Todos',
        icon: Users,
      },
      {
        id: 'users-students',
        href: '/admin/users?role=STUDENT',
        label: 'Alunos',
        icon: BookOpen,
      },
      {
        id: 'users-teachers',
        href: '/admin/users?role=TEACHER',
        label: 'Professores',
        icon: Users,
      },
      {
        id: 'users-admins',
        href: '/admin/users?role=ADMIN',
        label: 'Administradores',
        icon: Shield,
      },
    ],
  },
  {
    id: 'courses',
    href: '/admin/courses',
    label: 'Cursos',
    icon: BookOpen,
    children: [
      {
        id: 'courses-all',
        href: '/admin/courses',
        label: 'Todos',
        icon: BookOpen,
      },
      {
        id: 'categories',
        href: '/admin/categories',
        label: 'Categorias',
        icon: Menu,
      },
    ],
  },
  {
    id: 'enrollments',
    href: '/admin/enrollments',
    label: 'Matrículas',
    icon: GraduationCap,
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    children: [
      {
        id: 'payments',
        href: '/admin/payments',
        label: 'Transações',
        icon: DollarSign,
      },
      {
        id: 'plans',
        href: '/admin/plans',
        label: 'Planos & Preços',
        icon: BarChart3,
      },
      {
        id: 'subscriptions',
        href: '/admin/subscriptions',
        label: 'Assinaturas',
        icon: FileText,
      },
      {
        id: 'stripe-config',
        href: '/admin/stripe-config',
        label: 'Config Stripe',
        icon: Settings,
      },
    ],
  },
  {
    id: 'analytics',
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    children: [
      {
        id: 'reports-general',
        href: '/admin/reports',
        label: 'Geral',
        icon: FileText,
      },
      {
        id: 'reports-access',
        href: '/admin/reports/access',
        label: 'Acessos',
        icon: BarChart3,
      },
      {
        id: 'reports-certificates',
        href: '/admin/reports/certificates',
        label: 'Certificados',
        icon: GraduationCap,
      },
    ],
  },
  {
    id: 'messages',
    href: '/admin/messages',
    label: 'Mensagens',
    icon: MessageSquare,
    badge: 'dynamic', // vai buscar count de mensagens não lidas
  },
  {
    id: 'notifications',
    href: '/admin/notifications',
    label: 'Notificações',
    icon: Bell,
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: Shield,
    children: [
      {
        id: 'audit',
        href: '/admin/audit',
        label: 'Logs de Auditoria',
        icon: Shield,
      },
      {
        id: 'security-main',
        href: '/admin/security',
        label: 'Controle de Acesso',
        icon: Lock,
      },
    ],
  },
  {
    id: 'settings',
    href: '/admin/settings',
    label: 'Configurações',
    icon: Settings,
    children: [
      {
        id: 'settings-theme',
        href: '/admin/settings/theme',
        label: 'Tema',
        icon: Settings,
      },
      {
        id: 'settings-images',
        href: '/admin/images',
        label: 'Gerenciar Imagens',
        icon: FileText,
      },
    ],
  },
];

/**
 * SLOT NAVIGATION
 * Features premium em espaço separado
 * Usado em: dashboard-shell.tsx (slot nav)
 * ArchitectAI NOTE: SlotNav aparece depois do menu principal,
 * em uma barra horizontal para features especiais
 */
export const ADMIN_SLOT_NAV: SlotNavItem[] = [
  {
    id: 'ai-chat',
    href: '/admin/ai-chat',
    label: 'Chat IA',
    icon: Sparkles,
    locked: false,
    featureId: 'ai-assistant',
    badge: 'Beta',
  },
  {
    id: 'pro-tools',
    href: '/admin/analytics',
    label: 'Ferramentas Pro',
    icon: BarChart3,
    locked: false,
    featureId: 'pro-tools',
  },
];

/**
 * HELPERS
 */

/**
 * Buscar item de menu por ID
 */
export function findMenuItemById(
  id: string,
  items: MenuItem[] = ADMIN_MAIN_MENU
): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findMenuItemById(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Buscar parent de um item de menu por ID
 */
export function findMenuItemParent(
  id: string,
  items: MenuItem[] = ADMIN_MAIN_MENU,
  parent: MenuItem | null = null
): MenuItem | null {
  for (const item of items) {
    if (item.id === id) return parent;
    if (item.children) {
      const found = findMenuItemParent(id, item.children, item);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Verificar se rota está em um submenu
 * Usado para auto-expand collapsible
 */
export function getMenuIdForRoute(route: string): string | null {
  for (const item of ADMIN_MAIN_MENU) {
    if (item.href === route) return item.id;
    if (item.children) {
      for (const child of item.children) {
        if (child.href === route) return item.id; // Return parent ID
      }
    }
  }
  return null;
}

/**
 * Flatten menu para debug
 */
export function flattenMenuItems(
  items: MenuItem[] = ADMIN_MAIN_MENU
): MenuItem[] {
  const flat: MenuItem[] = [];
  for (const item of items) {
    flat.push(item);
    if (item.children) {
      flat.push(...flattenMenuItems(item.children));
    }
  }
  return flat;
}
