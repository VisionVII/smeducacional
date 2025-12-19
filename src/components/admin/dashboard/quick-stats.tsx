import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    newUsersLast30Days: number;
    newEnrollmentsLast7Days: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const cards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toLocaleString('pt-BR'),
      change: `+${stats.newUsersLast30Days}`,
      changeText: 'últimos 30 dias',
      icon: Users,
      trend: stats.newUsersLast30Days > 0 ? 'up' : 'neutral',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Cursos Ativos',
      value: stats.totalCourses.toLocaleString('pt-BR'),
      change: null,
      changeText: 'total disponível',
      icon: BookOpen,
      trend: 'neutral',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Matrículas',
      value: stats.totalEnrollments.toLocaleString('pt-BR'),
      change: `+${stats.newEnrollmentsLast7Days}`,
      changeText: 'últimos 7 dias',
      icon: GraduationCap,
      trend: stats.newEnrollmentsLast7Days > 0 ? 'up' : 'neutral',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })}`,
      change: null,
      changeText: 'pagamentos concluídos',
      icon: DollarSign,
      trend: 'up',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', card.bgColor)}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {card.change && (
                  <>
                    {card.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={cn(
                        'font-medium',
                        card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {card.change}
                    </span>
                  </>
                )}
                <span>{card.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
