import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabSystem({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabSystemProps) {
  return (
    <div
      className={cn(
        'flex gap-2 border-b overflow-x-auto pb-0 scrollbar-hide',
        className
      )}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
            activeTab === id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
