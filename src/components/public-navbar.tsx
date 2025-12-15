'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [mounted, setMounted] = useState(false);
  const { branding } = useSystemBranding();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-10 object-contain"
              />
            ) : (
              <>
                <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                <span className="hidden sm:inline font-bold text-lg">
                  {branding.companyName}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {/* Navigation Links Mobile */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Auth Buttons Mobile */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
