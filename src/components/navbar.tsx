'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  User,
  ChevronDown 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

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
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      STUDENT: 'Aluno',
      TEACHER: 'Professor',
      ADMIN: 'Administrador',
    };
    return labels[role] || role;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Mobile First */}
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg sm:text-xl">SM Educacional</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {links.map((link) => (
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
                <span className="hidden lg:inline">{link.label}</span>
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

            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
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
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-primary mt-1">{getRoleLabel(user.role)}</p>
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
            {/* User Info Mobile */}
            <div className="px-3 py-2 mb-3 bg-accent/50 rounded-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links Mobile */}
            {links.map((link) => (
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

            {/* Logout Mobile */}
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-3 h-auto text-sm font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
