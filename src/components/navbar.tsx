'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useSidebar } from '@/hooks/use-sidebar';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  User,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon3D } from '@/components/ui/icon-3d';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { useSystemBranding } from '@/hooks/use-system-branding';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from '@/hooks/use-translations';
import { CartIcon } from '@/components/cart/cart-icon';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  links: {
    href: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

export function Navbar({ user, links }: NavbarProps) {
  const pathname = usePathname();
  const mounted = useMounted();
  const { isOpen, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { branding } = useSystemBranding();
  const { t, mounted: translationsLoaded } = useTranslations();

  const handleLogout = async () => {
    // Limpa cache de tema do usuário antes de fazer logout
    sessionStorage.removeItem('user-theme-cache');
    await signOut({ callbackUrl: '/login' });
  };

  const getRoleLabel = (role: string) => {
    // Fallback durante loading
    if (!translationsLoaded || !t.roles) {
      const fallbackLabels: Record<string, string> = {
        STUDENT: 'Aluno',
        TEACHER: 'Professor',
        ADMIN: 'Administrador',
      };
      return fallbackLabels[role] || role;
    }

    const labels: Record<string, string> = {
      STUDENT: t.roles.STUDENT,
      TEACHER: t.roles.TEACHER,
      ADMIN: t.roles.ADMIN,
    };
    return labels[role] || role;
  };

  // Define home baseado no role do usuário
  const getHomeHref = () => {
    switch (user.role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav
      className="navbar-themed sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        backgroundImage: branding.navbarBgUrl
          ? `url(${branding.navbarBgUrl})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Sidebar Toggle + Logo - Mobile First */}
          <div className="flex items-center gap-1">
            {/* Sidebar toggle (visible para ADMIN/TEACHER) */}
            {mounted && user.role !== 'STUDENT' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                title={isOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
                className="h-10 w-10 hover:bg-accent"
              >
                {isOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {isOpen ? 'Fechar' : 'Abrir'} menu
                </span>
              </Button>
            )}

            {/* Logo */}
            <Link
              href={getHomeHref()}
              className="flex items-center gap-2 flex-shrink-0"
              onClick={() => setMobileMenuOpen(false)}
              suppressHydrationWarning
            >
              {!mounted || !branding.logoUrl ? (
                <Icon3D size="md" color="primary" rounded="full">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </Icon3D>
              ) : (
                <Image
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  width={120}
                  height={40}
                  unoptimized
                  className="h-10 object-contain"
                />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {links?.map((link) => {
              const isActive = mounted && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  suppressHydrationWarning
                  className={cn(
                    'navbar-link flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'navbar-link-active bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {link.icon}
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {mounted && <NotificationBell />}

            {/* Language Selector */}
            {mounted && <LanguageSwitcher />}

            {/* Cart Icon */}
            {mounted && <CartIcon />}

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            )}

            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-8 w-8">
                  <Avatar className="h-8 w-8 ring-1 ring-primary/20 shadow-sm">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      <Icon3D size="sm" color="primary" rounded="full">
                        <User className="h-4 w-4" />
                      </Icon3D>
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
                    <div className="p-3 border-b">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-target no-tap-highlight"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="mobile-overlay md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Menu Content */}
            <div
              id="mobile-menu"
              className="md:hidden border-t py-4 space-y-1 relative z-50 bg-background smooth-scroll"
              role="navigation"
              aria-label="Menu de navegação mobile"
            >
              {/* User Info Mobile */}
              <div className="px-3 py-2 mb-3 bg-accent/50 rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-primary/20 shadow-sm">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      <Icon3D size="sm" color="primary" rounded="full">
                        <User className="h-4 w-4" />
                      </Icon3D>
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-primary">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links Mobile */}
              {links?.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors touch-target no-tap-highlight',
                    pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground active:scale-95'
                  )}
                  suppressHydrationWarning
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {/* Logout Mobile */}
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-3 touch-target text-sm font-medium no-tap-highlight"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sair
              </Button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
