'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw, Grid3x3, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type GridLayout = 'compact' | 'comfortable' | 'spacious' | 'mobile-first';

interface DashboardGridProps {
  children: React.ReactNode;
  storageKey?: string;
}

const gridLayouts = {
  compact: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
  comfortable: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  spacious: 'grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8',
  'mobile-first':
    'grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6',
};

export function DashboardGrid({
  children,
  storageKey = 'admin-dashboard-layout',
}: DashboardGridProps) {
  const [layout, setLayout] = useState<GridLayout>('mobile-first');
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Carregar layout do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && saved in gridLayouts) {
      setLayout(saved as GridLayout);
    }
  }, [storageKey]);

  // Salvar layout no localStorage
  const handleLayoutChange = (newLayout: GridLayout) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, newLayout);
  };

  const resetLayout = () => {
    setLayout('mobile-first');
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Layout do Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCustomizing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            {isCustomizing ? 'Aplicar' : 'Personalizar'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Grid3x3 className="h-4 w-4 mr-1" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Escolher Layout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleLayoutChange('mobile-first')}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Mobile First</span>
                  <span className="text-xs text-muted-foreground">
                    Otimizado para celular
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange('compact')}>
                <div className="flex flex-col">
                  <span className="font-medium">Compacto</span>
                  <span className="text-xs text-muted-foreground">
                    Máximo de cards visíveis
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLayoutChange('comfortable')}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Confortável</span>
                  <span className="text-xs text-muted-foreground">
                    Equilíbrio ideal
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange('spacious')}>
                <div className="flex flex-col">
                  <span className="font-medium">Espaçoso</span>
                  <span className="text-xs text-muted-foreground">
                    Mais espaço entre cards
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetLayout}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Padrão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info ao personalizar */}
      {isCustomizing && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
            <strong>Modo Personalização:</strong> Selecione um layout no menu
            acima. Suas preferências serão salvas automaticamente.
          </p>
        </div>
      )}

      {/* Grid Responsivo */}
      <div
        className={cn(
          'grid',
          gridLayouts[layout],
          isCustomizing && 'ring-2 ring-blue-400 ring-offset-2 rounded-lg p-2'
        )}
      >
        {children}
      </div>
    </div>
  );
}
