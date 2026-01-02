'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ADMIN_MAIN_MENU,
  MenuItem,
  getMenuIdForRoute,
} from '@/config/admin-menu-v2';

export function AdminSidebar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Auto-expand menu quando rota mudar
  useEffect(() => {
    const parentId = getMenuIdForRoute(pathname);
    if (parentId) {
      setOpenItems((prev) =>
        prev.includes(parentId) ? prev : [...prev, parentId]
      );
    }
  }, [pathname]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderMenuItems = (items: MenuItem[]): React.ReactNode => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive =
        mounted &&
        item.href &&
        (pathname === item.href || pathname?.startsWith(item.href + '/'));
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openItems.includes(item.id);

      if (hasChildren) {
        return (
          <Collapsible
            key={item.id}
            open={isOpen}
            onOpenChange={() => toggleItem(item.id)}
          >
            <CollapsibleTrigger asChild suppressHydrationWarning>
              <button
                className={cn(
                  'flex items-center justify-between w-full gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && item.badge !== 'dynamic' && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isOpen && 'rotate-90'
                    )}
                  />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-11 pr-3 pt-2 space-y-1">
              {renderMenuItems(item.children || [])}
            </CollapsibleContent>
          </Collapsible>
        );
      }

      // Itens sem children devem ter href
      if (!item.href) return null;

      return (
        <Link
          key={item.id}
          href={item.href}
          suppressHydrationWarning
          className={cn(
            'flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </div>
          {item.badge && item.badge !== 'dynamic' && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      );
    });
  };

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
      <nav className="space-y-2 p-4">{renderMenuItems(ADMIN_MAIN_MENU)}</nav>
    </aside>
  );
}
