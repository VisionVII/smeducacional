'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  action: string;
  type: 'enrollment' | 'course' | 'payment' | 'user';
  createdAt: Date;
}

interface RecentActivityProps {
  activities: Activity[];
  title?: string;
  description?: string;
}

const typeConfig = {
  enrollment: {
    label: 'Matrícula',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  course: {
    label: 'Curso',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  payment: {
    label: 'Pagamento',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  user: {
    label: 'Usuário',
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
};

export function RecentActivity({
  activities,
  title = 'Atividade Recente',
  description = 'Últimas ações no sistema',
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                  <AvatarImage src={activity.user.avatar || ''} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {activity.user.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {activity.user.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', typeConfig[activity.type].color)}
                    >
                      {typeConfig[activity.type].label}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(activity.createdAt),
                      "dd 'de' MMMM 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
