/**
 * Admin Navigation Menu
 * Links para todas as ferramentas administrativas
 */

export const ADMIN_MENU_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: '📊',
    description: 'Visão geral e métricas',
  },
  {
    label: 'Usuários',
    href: '/admin/users',
    icon: '👥',
    description: 'Gerenciar usuários',
  },
  {
    label: 'Cursos',
    href: '/admin/courses',
    icon: '📚',
    description: 'Gerenciar cursos',
  },
  {
    label: 'Pagamentos',
    href: '/admin/payments',
    icon: '💳',
    description: 'Transações e pagamentos',
  },
  {
    label: 'Stripe Config',
    href: '/admin/stripe-config',
    icon: '⚙️',
    description: 'Conectar Stripe (teste/produção)',
  },
  {
    label: 'Auditoria',
    href: '/admin/audit-logs',
    icon: '📝',
    description: 'Logs de ações administrativas',
  },
  {
    label: 'Configurações',
    href: '/admin/settings',
    icon: '🔧',
    description: 'Configurações gerais',
  },
];
