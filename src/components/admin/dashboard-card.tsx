'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  value?: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  value,
  trend,
}: DashboardCardProps) {
  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-medium">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          )}
        </div>
        {description && (
          <CardDescription className="text-xs sm:text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {value !== undefined && (
          <div className="space-y-2">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {value}
            </div>
            {trend && (
              <p
                className={cn(
                  'text-xs sm:text-sm font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
