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
    switch (userRole) {
      case 'ADMIN':
        return '/admin/settings/theme';
      case 'TEACHER':
        return '/teacher/settings/theme';
      case 'STUDENT':
        return '/student/settings/theme';
      default:
        return '/settings/theme';
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Palette className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Aparência</DropdownMenuLabel>
        <DropdownMenuSeparator />

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
          <a
            href={getThemeSettingsUrl()}
            className="flex items-center cursor-pointer"
          >
            <Palette className="h-4 w-4 mr-2" />
            <span>Personalizar Cores</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
