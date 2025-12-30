'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useMemo } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  GraduationCap,
  DollarSign,
  Settings,
  Bell,
  Menu,
  Search,
  LogOut,
  User,
  BarChart3,
  MessageSquare,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
};

type SlotNavItem = NavItem & {
  locked?: boolean;
  upsellHref?: string;
  featureId?: string;
};

type DashboardShellProps = {
  role: Role;
  user: {
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
  onLogoutAction?: () => void;
  navItems?: NavItem[];
  slotNavItems?: SlotNavItem[];
  checkFeatureAccessAction?: (featureId: string) => boolean;
};

const operationalCoreNav: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/audit', label: 'Logs', icon: Shield },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ],
  TEACHER: [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Gestão', icon: BookOpen },
    { href: '/teacher/settings', label: 'Configurações', icon: Settings },
  ],
  STUDENT: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Meus Cursos', icon: BookOpen },
    { href: '/student/settings', label: 'Configurações', icon: Settings },
  ],
};

const legacyNav: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/courses', label: 'Cursos', icon: BookOpen },
    { href: '/admin/enrollments', label: 'Matrículas', icon: GraduationCap },
    { href: '/admin/payments', label: 'Financeiro', icon: DollarSign },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ],
  TEACHER: [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Meus Cursos', icon: BookOpen },
    { href: '/teacher/students', label: 'Gestão de Alunos', icon: Users },
    { href: '/teacher/earnings', label: 'Ganhos', icon: DollarSign },
    {
      href: '/teacher/activities',
      label: 'Banco de Atividades',
      icon: BookOpen,
    },
    { href: '/teacher/settings', label: 'Configurações', icon: Settings },
  ],
  STUDENT: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Meus Cursos', icon: BookOpen },
    { href: '/student/activities', label: 'Atividades', icon: CheckCircle2 },
    {
      href: '/student/certificates',
      label: 'Certificados',
      icon: GraduationCap,
    },
    { href: '/student/settings', label: 'Configurações', icon: Settings },
  ],
};

const defaultSlotNav: Record<Role, SlotNavItem[]> = {
  ADMIN: [
    {
      href: '/admin/ai-assistant',
      label: 'Chat IA',
      icon: MessageSquare,
      locked: true,
      upsellHref: '/checkout/ai-suite',
      badge: 'Pro',
      featureId: 'ai-assistant',
    },
    {
      href: '/admin/plans/stripe',
      label: 'Mentorias',
      icon: Sparkles,
      locked: false,
      featureId: 'mentorships',
    },
    {
      href: '/admin/advertisements',
      label: 'Ferramentas Pro',
      icon: BarChart3,
      locked: false,
      featureId: 'pro-tools',
    },
  ],
  TEACHER: [
    {
      href: '/teacher/ai-assistant',
      label: 'Chat IA',
      icon: MessageSquare,
      locked: true,
      upsellHref: '/checkout/chat-ia',
      badge: 'Pro',
      featureId: 'ai-assistant',
    },
    {
      href: '/teacher/mentorships',
      label: 'Mentorias',
      icon: Sparkles,
      locked: true,
      upsellHref: '/checkout/mentorias',
      featureId: 'mentorships',
    },
    {
      href: '/teacher/tools',
      label: 'Ferramentas Pro',
      icon: BarChart3,
      featureId: 'pro-tools',
    },
  ],
  STUDENT: [
    {
      href: '/student/ai-chat',
      label: 'Chat IA',
      icon: MessageSquare,
      locked: true,
      upsellHref: '/checkout/chat-ia',
      badge: 'Pro',
      featureId: 'ai-assistant',
    },
    {
      href: '/student/mentorships',
      label: 'Mentorias',
      icon: Sparkles,
      locked: true,
      upsellHref: '/checkout/mentorias',
      featureId: 'mentorships',
    },
    {
      href: '/student/tools',
      label: 'Ferramentas Pro',
      icon: BarChart3,
      featureId: 'pro-tools',
    },
  ],
};

const dedupeNav = (items: NavItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
};

const renderAvatarInitials = (name?: string | null, email?: string) => {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2)
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`;
    return parts[0]?.[0] ?? '';
  }
  return email?.slice(0, 2).toUpperCase() ?? '';
};

export function DashboardShell({
  role,
  user,
  children,
  navItems,
  onLogoutAction,
  slotNavItems,
  checkFeatureAccessAction,
}: DashboardShellProps) {
  const pathname = usePathname();
  const mounted = useMounted();

  const navigation = useMemo(() => {
    const core = operationalCoreNav[role];
    const extras = navItems || legacyNav[role];
    return dedupeNav([...core, ...extras]);
  }, [navItems, role]);

  const slotNavigation = useMemo(() => {
    const base = slotNavItems || defaultSlotNav[role];
    if (!checkFeatureAccessAction) return base;
    return base.filter((item) =>
      item.featureId
        ? checkFeatureAccessAction(item.featureId) || item.locked
        : true
    );
  }, [checkFeatureAccessAction, role, slotNavItems]);

  const userAvatarFallback = renderAvatarInitials(user.name, user.email);

  const userMenuLogout = () => {
    if (onLogoutAction) return onLogoutAction();
    return signOut({ callbackUrl: '/login' });
  };

  const Sidebar = (
    <aside className="flex flex-col h-full" aria-label="Menu operacional">
      <div className="px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Painel
          </p>
          <p className="font-semibold">SM Educa</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {role}
        </Badge>
      </div>
      <Separator />
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1" aria-label="Navegação operacional">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              mounted &&
              (pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <div key={item.href} suppressHydrationWarning>
                <Link
                  href={item.href}
                  suppressHydrationWarning
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive &&
                      'bg-accent text-accent-foreground border border-border'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge variant="outline" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
      <Separator />
      <div className="px-4 py-3 text-xs text-muted-foreground">
        Projeto VisionVII • UX Shell
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-64 border-r bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:flex-shrink-0">
          {Sidebar}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col gap-3 px-4 py-3 w-full max-w-screen-xl mx-auto">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72">
                    {Sidebar}
                  </SheetContent>
                </Sheet>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar em todo o painel"
                    className="pl-10 pr-4 w-full"
                    type="search"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {user.avatar ? (
                              <AvatarImage
                                src={user.avatar}
                                alt={user.name || user.email}
                              />
                            ) : null}
                            <AvatarFallback>
                              {userAvatarFallback}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold leading-tight line-clamp-1">
                              {user.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuLabel>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">
                            {user.name || 'Usuário'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" /> Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" /> Configurações
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={userMenuLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="relative">
                <nav
                  className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
                  aria-label="Slots premium"
                >
                  {slotNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      mounted &&
                      (pathname === item.href ||
                        pathname.startsWith(item.href + '/'));
                    const targetHref =
                      item.locked && item.upsellHref
                        ? item.upsellHref
                        : item.href;

                    return (
                      <div key={item.href} suppressHydrationWarning>
                        <Button
                          suppressHydrationWarning
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'shrink-0 gap-2',
                            isActive && 'shadow-sm'
                          )}
                          asChild
                        >
                          <Link
                            href={targetHref}
                            className="flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="whitespace-nowrap">
                              {item.label}
                            </span>
                            {item.badge ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {item.badge}
                              </Badge>
                            ) : null}
                            {item.locked ? <Lock className="h-3 w-3" /> : null}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </nav>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
                />
              </div>
            </div>
          </header>

          <main
            className="flex-1 px-4 py-6 sm:px-6 lg:px-8 w-full max-w-screen-xl mx-auto"
            aria-label="Conteúdo principal"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
