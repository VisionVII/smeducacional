import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SystemHealthWidgetProps {
  health: {
    errors: number;
    activeUsers: number;
  };
}

export function SystemHealthWidget({ health }: SystemHealthWidgetProps) {
  const status =
    health.errors === 0
      ? 'healthy'
      : health.errors < 5
      ? 'warning'
      : 'critical';

  const statusConfig = {
    healthy: {
      label: 'Sistema Saudável',
      icon: CheckCircle,
      color: 'text-green-600',
      badgeClass:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    warning: {
      label: 'Atenção Necessária',
      icon: AlertCircle,
      color: 'text-yellow-600',
      badgeClass:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    critical: {
      label: 'Crítico',
      icon: AlertCircle,
      color: 'text-red-600',
      badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Saúde do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status geral */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-5 w-5', config.color)} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <Badge className={config.badgeClass}>
              {status === 'healthy'
                ? '100%'
                : `${Math.max(0, 100 - health.errors * 10)}%`}
            </Badge>
          </div>

          {/* Métricas */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Erros (24h)</span>
              <span
                className={cn(
                  'font-medium',
                  health.errors === 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {health.errors}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Usuários ativos (24h)
              </span>
              <span className="font-medium">{health.activeUsers}</span>
            </div>
          </div>

          {health.errors > 0 && (
            <div className="pt-2 border-t">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/logs">Ver Logs de Erro</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
