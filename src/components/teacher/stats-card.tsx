import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'from-blue-500 to-blue-600',
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group',
        className
      )}
    >
      {/* Background decorativo com gradiente sutil */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-bl-[100px] group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/3 to-transparent rounded-tr-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-3 rounded-xl shadow-lg group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 bg-gradient-to-br relative',
            iconColor
          )}
        >
          <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Icon className="h-5 w-5 text-white relative z-10" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-2 pb-6">
        <div className="text-3xl sm:text-4xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300 origin-left">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 line-clamp-2">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <span
              className={cn(
                'text-xs font-semibold px-2 py-1 rounded-full',
                trend.value >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
