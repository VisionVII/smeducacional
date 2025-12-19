import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentActivityFeedProps {
  activity: [
    Array<{
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      role: string;
      createdAt: Date;
    }>,
    Array<{
      id: string;
      enrolledAt: Date;
      student: {
        name: string | null;
        email: string;
        avatar: string | null;
      };
      course: {
        title: string;
      };
    }>
  ];
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  const [newUsers, newEnrollments] = activity;

  const allActivity = [
    ...newUsers.map((user) => ({
      id: `user-${user.id}`,
      type: 'user' as const,
      user: {
        name: user.name || 'Sem nome',
        email: user.email,
        avatar: user.avatar,
      },
      action: `Novo ${
        user.role === 'STUDENT'
          ? 'aluno'
          : user.role === 'TEACHER'
          ? 'professor'
          : 'admin'
      } cadastrado`,
      timestamp: user.createdAt,
    })),
    ...newEnrollments.map((enrollment) => ({
      id: `enrollment-${enrollment.id}`,
      type: 'enrollment' as const,
      user: enrollment.student,
      action: `Matriculou-se em ${enrollment.course.title}`,
      timestamp: enrollment.enrolledAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  const typeColors = {
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    enrollment:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            allActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.user.avatar || ''} />
                  <AvatarFallback className="text-xs">
                    {item.user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">
                      {item.user.name}
                    </p>
                    <Badge variant="outline" className={typeColors[item.type]}>
                      {item.type === 'user' ? 'Novo usuário' : 'Matrícula'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
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
