'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'flat';

export type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: string;
    direction?: TrendDirection;
    label?: string;
  };
  miniChartData?: number[];
  isLoading?: boolean;
};

const directionColor: Record<TrendDirection, string> = {
  up: 'text-emerald-600 bg-emerald-500/10',
  down: 'text-red-600 bg-red-500/10',
  flat: 'text-muted-foreground bg-muted',
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  miniChartData,
  isLoading,
}: StatsCardProps) {
  if (isLoading) return <StatsCardSkeleton />;

  const chartValues = (miniChartData || []).filter((v) => Number.isFinite(v));
  const chartMax = chartValues.length ? Math.max(...chartValues) || 1 : 1;

  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/40 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/40" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {description ? (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white',
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          {trend ? (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                directionColor[trend.direction || 'up']
              )}
            >
              <span>{trend.value}</span>
              {trend.label ? (
                <span className="text-muted-foreground/80">{trend.label}</span>
              ) : null}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Atualizado agora
            </div>
          )}
          {chartValues.length > 0 ? (
            <div className="flex items-end gap-1 h-12 w-36 justify-end">
              {chartValues.map((v, idx) => {
                const height = `${Math.max((v / chartMax) * 100, 8).toFixed(
                  0
                )}%`;
                return (
                  <span
                    key={`${v}-${idx}`}
                    className="w-[10px] rounded-full bg-gradient-to-t from-primary/20 to-primary"
                    style={{ height }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCardSkeleton() {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
