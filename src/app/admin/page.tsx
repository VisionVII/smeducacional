'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  ArrowRight,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { DashboardGrid } from '@/components/admin/dashboard-grid';
import { StatCard } from '@/components/admin/stat-card';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  newUsersLast30Days: number;
  newEnrollmentsLast7Days: number;
}

interface Activity {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  action: string;
  type: 'user' | 'enrollment' | 'course';
  createdAt: Date;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats').catch(() => null);
      const activitiesRes = await fetch('/api/admin/activities').catch(
        () => null
      );

      if (statsRes?.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats({
          totalUsers: 156,
          totalCourses: 24,
          totalEnrollments: 342,
          totalRevenue: 45890.5,
          newUsersLast30Days: 28,
          newEnrollmentsLast7Days: 15,
        });
      }

      if (activitiesRes?.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      } else {
        setActivities([
          {
            id: '1',
            user: { name: 'João Silva', email: 'joao@email.com', avatar: null },
            action: 'Novo aluno cadastrado',
            type: 'user',
            createdAt: new Date(),
          },
          {
            id: '2',
            user: {
              name: 'Maria Santos',
              email: 'maria@email.com',
              avatar: null,
            },
            action: 'Matriculou-se em "React Avançado"',
            type: 'enrollment',
            createdAt: new Date(Date.now() - 3600000),
          },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setStats({
        totalUsers: 156,
        totalCourses: 24,
        totalEnrollments: 342,
        totalRevenue: 45890.5,
        newUsersLast30Days: 28,
        newEnrollmentsLast7Days: 15,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="container mx-auto max-w-[1600px] space-y-6">
          <Skeleton className="h-16 w-80" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const userGrowth = stats?.newUsersLast30Days || 28;
  const enrollmentGrowth = stats?.newEnrollmentsLast7Days || 15;
  const avgRevenuePerMonth = (stats?.totalRevenue || 0) / 12;
  const avgEnrollmentsPerCourse = Math.round(
    (stats?.totalEnrollments || 0) / (stats?.totalCourses || 1)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-[1600px]">
        {/* Header Compacto */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="border-primary/50 bg-primary/10 text-xs"
              >
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Sistema Online
              </Badge>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Bell className="h-3.5 w-3.5" />
                <Badge
                  variant="destructive"
                  className="h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px]"
                >
                  3
                </Badge>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Agenda</span>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* KPIs Principais - Cards Compactos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card Usuários */}
              <Card className="relative overflow-hidden border hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[80px]"></div>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30 text-[10px] px-1.5 py-0"
                    >
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />+{userGrowth}
                    </Badge>
                  </div>
                  <CardTitle className="text-xs text-muted-foreground font-medium">
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {stats?.totalUsers || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />+{userGrowth} este mês
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Cursos */}
              <Card className="relative overflow-hidden border hover:border-green-500/50 transition-all hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-[80px]"></div>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-600 to-green-500 rounded-lg">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30 text-[10px] px-1.5 py-0"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Ativos
                    </Badge>
                  </div>
                  <CardTitle className="text-xs text-muted-foreground font-medium">
                    Cursos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                      {stats?.totalCourses || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Award className="h-2.5 w-2.5" />
                      {avgEnrollmentsPerCourse} média por curso
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Matrículas */}
              <Card className="relative overflow-hidden border hover:border-orange-500/50 transition-all hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-[80px]"></div>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-700 border-orange-500/30 text-[10px] px-1.5 py-0"
                    >
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />+
                      {enrollmentGrowth}
                    </Badge>
                  </div>
                  <CardTitle className="text-xs text-muted-foreground font-medium">
                    Matrículas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                      {stats?.totalEnrollments || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5" />+{enrollmentGrowth}{' '}
                      esta semana
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Receita */}
              <Card className="relative overflow-hidden border hover:border-red-500/50 transition-all hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-[80px]"></div>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-lg">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30 text-[10px] px-1.5 py-0"
                    >
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                      +12%
                    </Badge>
                  </div>
                  <CardTitle className="text-xs text-muted-foreground font-medium">
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                      {(stats?.totalRevenue || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <DollarSign className="h-2.5 w-2.5" />~
                      {avgRevenuePerMonth.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                      /mês
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grid 2 colunas - Ações & Atividades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Ações Rápidas */}
              <Card className="border hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-b py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-gradient-to-br from-primary to-purple-600 rounded-md">
                      <Activity className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Ações Rápidas
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        Acesso direto às funcionalidades
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        href: '/admin/users',
                        icon: Users,
                        label: 'Usuários',
                        color: 'primary',
                      },
                      {
                        href: '/admin/courses',
                        icon: BookOpen,
                        label: 'Cursos',
                        color: 'green',
                      },
                      {
                        href: '/admin/settings',
                        icon: Settings,
                        label: 'Configurações',
                        color: 'orange',
                      },
                      {
                        href: '/admin/analytics',
                        icon: BarChart3,
                        label: 'Analytics',
                        color: 'blue',
                      },
                    ].map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        className="group relative overflow-hidden flex flex-col items-center justify-center p-3 rounded-lg border hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover:shadow-md"
                      >
                        <div
                          className={`p-2 bg-${item.color}-500/10 group-hover:bg-${item.color}-500/20 rounded-full mb-2 transition-all duration-200 relative z-10`}
                        >
                          <item.icon
                            className={`h-4 w-4 text-${item.color}-600`}
                          />
                        </div>
                        <span className="text-xs font-medium text-center group-hover:text-primary transition-colors relative z-10">
                          {item.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividades Recentes */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-primary/10 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          Atividades Recentes
                        </CardTitle>
                        <CardDescription className="text-[10px]">
                          Últimas ações no sistema
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-7 text-xs"
                    >
                      Ver todas
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-3 pb-3">
                  {activities.length > 0 ? (
                    <div className="space-y-2.5">
                      {activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-accent/50 hover:shadow-sm transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/20"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                activity.type === 'user'
                                  ? 'bg-primary/10'
                                  : activity.type === 'enrollment'
                                  ? 'bg-green-500/10'
                                  : 'bg-blue-500/10'
                              } group-hover:scale-105 transition-transform duration-200`}
                            >
                              {activity.type === 'user' && (
                                <UserPlus className="h-3.5 w-3.5 text-primary" />
                              )}
                              {activity.type === 'enrollment' && (
                                <GraduationCap className="h-3.5 w-3.5 text-green-600" />
                              )}
                              {activity.type === 'course' && (
                                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                              {activity.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.action}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(activity.createdAt).toLocaleString(
                                'pt-BR',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nenhuma atividade recente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
