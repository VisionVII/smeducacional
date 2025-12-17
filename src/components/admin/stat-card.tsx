'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'border-border',
  primary:
    'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30',
  success:
    'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30',
  warning:
    'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/30',
  danger: 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30',
};

const iconVariantStyles = {
  default: 'text-muted-foreground',
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card
      className={cn('transition-all hover:shadow-lg', variantStyles[variant])}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-2 rounded-lg bg-background/80',
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-1 sm:space-y-2">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {value}
          </div>

          {trend && (
            <div className="flex items-center gap-1">
              {trend.positive ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value}
              </span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
