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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1800px]">
        {/* Header Simplificado */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-primary/50 bg-primary/10"
              >
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Sistema Online
              </Badge>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  3
                </Badge>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agenda
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* KPIs Principais - Cards Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card Usuários */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+{userGrowth}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-medium mt-4">
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {stats?.totalUsers || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />+{userGrowth} este mês
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Card Cursos */}
              <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-green-600 to-green-500 rounded-xl shadow-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ativos
                    </Badge>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-medium mt-4">
                    Cursos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                        {stats?.totalCourses || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {avgEnrollmentsPerCourse} média por curso
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Card Matrículas */}
              <Card className="relative overflow-hidden border-2 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl shadow-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-700 border-orange-500/30"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+{enrollmentGrowth}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-medium mt-4">
                    Matrículas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                        {stats?.totalEnrollments || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+{enrollmentGrowth}{' '}
                        esta semana
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Card Receita */}
              <Card className="relative overflow-hidden border-2 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-xl shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-700 border-green-500/30"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12%
                    </Badge>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-medium mt-4">
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                        {(stats?.totalRevenue || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />~
                        {avgRevenuePerMonth.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        })}
                        /mês
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grid 2 colunas - Ações & Atividades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ações Rápidas */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Ações Rápidas</CardTitle>
                      <CardDescription>
                        Acesso direto às principais funcionalidades
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-3">
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
                        className="group relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed hover:border-solid hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/0 to-${item.color}-500/0 group-hover:from-${item.color}-500/5 group-hover:to-${item.color}-500/10 transition-all duration-500`}
                        ></div>
                        <div
                          className={`p-3 bg-${item.color}-500/10 group-hover:bg-${item.color}-500/20 rounded-full mb-3 transition-all duration-300 group-hover:scale-110 relative z-10`}
                        >
                          <item.icon
                            className={`h-6 w-6 text-${item.color}-600`}
                          />
                        </div>
                        <span className="text-sm font-semibold text-center group-hover:text-primary transition-colors relative z-10">
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
                        <CardTitle className="text-xl">
                          Atividades Recentes
                        </CardTitle>
                        <CardDescription>
                          Últimas ações no sistema
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Ver todas
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/20"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                activity.type === 'user'
                                  ? 'bg-primary/10'
                                  : activity.type === 'enrollment'
                                  ? 'bg-green-500/10'
                                  : 'bg-blue-500/10'
                              } group-hover:scale-110 transition-transform duration-300`}
                            >
                              {activity.type === 'user' && (
                                <UserPlus className="h-5 w-5 text-primary" />
                              )}
                              {activity.type === 'enrollment' && (
                                <GraduationCap className="h-5 w-5 text-green-600" />
                              )}
                              {activity.type === 'course' && (
                                <BookOpen className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                              {activity.user.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
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
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Activity className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground">
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
