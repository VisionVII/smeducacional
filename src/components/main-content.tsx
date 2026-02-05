'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        isOpen ? 'md:ml-64' : 'md:ml-20',
        className
      )}
    >
      {children}
    </main>
  );
}
