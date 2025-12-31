'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * ThemeToggle: Componente de controle rápido de tema
 * - Dark/Light Mode Toggle
 * - Link para página de customização completa
 */
export function ThemeToggle({
  userRole,
}: {
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app-theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app-theme-mode', 'light');
    }
  };

  const getThemeSettingsUrl = () => {
    const baseUrls: Record<string, string> = {
      ADMIN: '/admin/theme-settings',
      TEACHER: '/teacher/theme-settings',
      STUDENT: '/student/theme-settings',
    };
    return baseUrls[userRole] || '/student/theme-settings';
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>

        <DropdownMenuItem onClick={toggleDarkMode}>
          {isDark ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              <span>Modo Escuro</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={getThemeSettingsUrl()} className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            <span>Personalizar Cores</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
