'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Moon,
  Sun,
  Menu,
  X,
  BookOpen,
  Users,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSystemBranding } from '@/hooks/use-system-branding';

export function PublicNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useSystemBranding();

  const publicLinks = [
    {
      href: '/',
      label: 'Início',
    },
    {
      href: '/courses',
      label: 'Cursos',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: '/about',
      label: 'Sobre',
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: '/faq',
      label: 'FAQ',
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      href: '/contact',
      label: 'Contato',
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            {branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt={branding.companyName}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : null}
            {!branding.logoUrl && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {branding.companyName}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks?.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
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

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

        {/* Mobile Menu - Popup Elegante */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop com blur */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
              style={{ top: '64px' }}
            />

            {/* Menu Drawer */}
            <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-primary/20 shadow-2xl animate-in slide-in-from-top-2 duration-300 z-50">
              <div className="px-4 py-6 space-y-2">
                {/* Navigation Links Mobile */}
                {publicLinks?.map((link, idx) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 group',
                      pathname === link.href
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-lg'
                        : 'hover:bg-primary/10 hover:translate-x-1 text-foreground'
                    )}
                    style={{
                      animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <span
                      className={cn(
                        'group-hover:scale-110 transition-transform',
                        pathname === link.href ? 'text-white' : 'text-primary'
                      )}
                    >
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4" />

                {/* Auth Buttons Mobile */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold hover:scale-105 transition-transform"
                    asChild
                  >
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button
                    className="w-full h-11 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    asChild
                  >
                    <Link href="/register">Cadastrar</Link>
                  </Button>
                </div>
              </div>

              <style>{`
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateX(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
              `}</style>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
