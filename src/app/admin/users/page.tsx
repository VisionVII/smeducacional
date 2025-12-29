'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Search,
  Mail,
  Trash2,
  Edit,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Award,
  UserPlus,
  Filter,
  Download,
  MessageSquare,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from '@/hooks/use-translations';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  enrollmentCount?: number;
  courseCount?: number;
  completionRate?: number; // Taxa de conclusão (%)
  lastActiveAt?: string;
  avgStudyTime?: number; // Tempo médio de estudo em horas
  performanceStatus?: 'excellent' | 'good' | 'needs-attention' | 'inactive';
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  activeStudents: number;
  studentsAtRisk: number;
  avgCompletionRate: number;
}

export default function AdminUsersPage() {
  const { t } = useTranslations();
  const pageT = t.adminUsersPage;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Buscar usuários
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(pageT.toasts.loadError);
      const data = await res.json();
      // Mock performance data
      return data.map((user: User) => ({
        ...user,
        completionRate: Math.floor(Math.random() * 100),
        avgStudyTime: Math.floor(Math.random() * 30) + 5,
        lastActiveAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        performanceStatus:
          user.role === 'STUDENT'
            ? ['excellent', 'good', 'needs-attention', 'inactive'][
                Math.floor(Math.random() * 4)
              ]
            : undefined,
      }));
    },
  });

  // Capturar timestamp estável para cálculos
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);

  // Calcular estatísticas
  const stats: DashboardStats = useMemo(() => {
    return {
      totalStudents: users?.filter((u) => u.role === 'STUDENT').length || 0,
      totalTeachers: users?.filter((u) => u.role === 'TEACHER').length || 0,
      totalAdmins: users?.filter((u) => u.role === 'ADMIN').length || 0,
      activeStudents:
        users?.filter(
          (u) =>
            u.role === 'STUDENT' &&
            u.lastActiveAt &&
            new Date(u.lastActiveAt) > new Date(now - 7 * 24 * 60 * 60 * 1000)
        ).length || 0,
      studentsAtRisk:
        users?.filter(
          (u) =>
            u.role === 'STUDENT' && u.performanceStatus === 'needs-attention'
        ).length || 0,
      avgCompletionRate:
        (users
          ?.filter((u) => u.role === 'STUDENT')
          .reduce((acc, u) => acc + (u.completionRate || 0), 0) ?? 0) /
        (users?.filter((u) => u.role === 'STUDENT').length || 1),
    };
  }, [users, now]);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(pageT.toasts.deleteErrorTitle);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: pageT.toasts.deleteSuccessTitle,
        description: pageT.toasts.deleteSuccessDescription,
      });
    },
    onError: () => {
      toast({
        title: pageT.toasts.deleteErrorTitle,
        description: pageT.toasts.deleteErrorDescription,
        variant: 'destructive',
      });
    },
  });

  const getPerformanceBadge = (status?: User['performanceStatus']) => {
    if (!status) return null;

    const variants = {
      excellent: {
        label: pageT.badges.excellent,
        variant: 'default' as const,
        icon: Award,
        className:
          'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      },
      good: {
        label: pageT.badges.good,
        variant: 'secondary' as const,
        icon: TrendingUp,
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      },
      'needs-attention': {
        label: pageT.badges.needsAttention,
        variant: 'destructive' as const,
        icon: AlertTriangle,
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
      },
      inactive: {
        label: pageT.badges.inactive,
        variant: 'outline' as const,
        icon: Clock,
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeSinceActive = (lastActiveAt?: string) => {
    if (!lastActiveAt) return pageT.metrics.never;
    const diff = now - new Date(lastActiveAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return pageT.metrics.today;
    if (days === 1) return pageT.metrics.yesterday;
    if (days < 7) return pageT.metrics.daysAgo.replace('{count}', String(days));
    return pageT.metrics.weeksAgo.replace(
      '{count}',
      String(Math.floor(days / 7))
    );
  };

  const filteredUsers = users?.filter((user) => {
    // Filtro de busca
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de tab (role)
    let matchesRole = false;
    if (activeTab === 'students') matchesRole = user.role === 'STUDENT';
    else if (activeTab === 'teachers') matchesRole = user.role === 'TEACHER';
    else if (activeTab === 'admins') matchesRole = user.role === 'ADMIN';
    else matchesRole = true;

    // Filtro de status (apenas para alunos)
    let matchesStatus = true;
    if (activeTab === 'students' && statusFilter !== 'all') {
      matchesStatus = user.performanceStatus === statusFilter;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-[1600px]">
        <Skeleton className="h-12 w-64 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              {pageT.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {pageT.subtitle}
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            {pageT.newUser}
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/20 border-blue-200 dark:border-blue-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalStudents}
            </CardTitle>
            <CardDescription className="text-xs">
              {pageT.stats.totalStudents}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/20 border-green-200 dark:border-green-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.activeStudents}
            </CardTitle>
            <CardDescription className="text-xs">
              {pageT.stats.activeStudents}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/20 border-purple-200 dark:border-purple-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalTeachers}
            </CardTitle>
            <CardDescription className="text-xs">
              {pageT.stats.totalTeachers}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/20 border-orange-200 dark:border-orange-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.studentsAtRisk}
            </CardTitle>
            <CardDescription className="text-xs">
              {pageT.stats.studentsAtRisk}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs e Filtros */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="students" className="text-xs sm:text-sm">
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {pageT.tabs.students}
                  </span>
                  <span className="sm:hidden">{pageT.tabs.students}</span>
                </TabsTrigger>
                <TabsTrigger value="teachers" className="text-xs sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {pageT.tabs.teachers}
                  </span>
                  <span className="sm:hidden">{pageT.tabs.teachersShort}</span>
                </TabsTrigger>
                <TabsTrigger value="admins" className="text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{pageT.tabs.admins}</span>
                  <span className="sm:hidden">{pageT.tabs.adminsShort}</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {pageT.actions.export}
                  </span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {pageT.actions.filters}
                  </span>
                </Button>
              </div>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  activeTab === 'students'
                    ? pageT.searchPlaceholder.students
                    : activeTab === 'teachers'
                    ? pageT.searchPlaceholder.teachers
                    : pageT.searchPlaceholder.admins
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Status (apenas para alunos) */}
            {activeTab === 'students' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs"
                >
                  {pageT.statusFilters.all}
                </Button>
                <Button
                  variant={statusFilter === 'excellent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('excellent')}
                  className="text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  {pageT.statusFilters.excellent}
                </Button>
                <Button
                  variant={statusFilter === 'good' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('good')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {pageT.statusFilters.good}
                </Button>
                <Button
                  variant={
                    statusFilter === 'needs-attention' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setStatusFilter('needs-attention')}
                  className="text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {pageT.statusFilters.attention}
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {pageT.statusFilters.inactive}
                </Button>
              </div>
            )}

            {/* Lista de Usuários */}
            <TabsContent value={activeTab} className="mt-0">
              {!filteredUsers || filteredUsers.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {pageT.empty.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {pageT.empty.description}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {filteredUsers?.map((user) => (
                    <Card
                      key={user.id}
                      className="hover:shadow-lg transition-all duration-200"
                    >
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-sm sm:text-base">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <CardTitle className="text-sm sm:text-base truncate">
                                {user.name}
                              </CardTitle>
                              {getPerformanceBadge(user.performanceStatus)}
                            </div>
                            <CardDescription className="text-xs flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {user.email}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Métricas Educacionais */}
                      {user.role === 'STUDENT' && (
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <Target className="h-4 w-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {pageT.metrics.completion}
                                </p>
                                <p className="text-sm sm:text-base font-bold">
                                  {user.completionRate || 0}%
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {pageT.metrics.courses}
                                </p>
                                <p className="text-sm sm:text-base font-bold">
                                  {user.enrollmentCount || 0}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg col-span-2 sm:col-span-1">
                              <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {pageT.metrics.studyTime}
                                </p>
                                <p className="text-sm sm:text-base font-bold">
                                  {user.avgStudyTime || 0}h
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                            <span>
                              {pageT.metrics.lastAccess}{' '}
                              {getTimeSinceActive(user.lastActiveAt)}
                            </span>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {pageT.actions.progress}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {pageT.actions.message}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      )}

                      {/* Métricas para Professores */}
                      {user.role === 'TEACHER' && (
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {pageT.metrics.courses}
                                </p>
                                <p className="text-sm sm:text-base font-bold">
                                  {user.courseCount || 0}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {pageT.metrics.students}
                                </p>
                                <p className="text-sm sm:text-base font-bold">
                                  {user.enrollmentCount || 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                            <span>
                              {pageT.metrics.lastAccess}{' '}
                              {getTimeSinceActive(user.lastActiveAt)}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {pageT.actions.viewCourses}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {pageT.actions.message}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      )}

                      {/* Métricas para Admins */}
                      {user.role === 'ADMIN' && (
                        <CardContent className="p-3 sm:p-4 pt-0">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>
                              {pageT.metrics.lastAccess}{' '}
                              {getTimeSinceActive(user.lastActiveAt)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {pageT.actions.message}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Footer Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {pageT.footer.showing
              .replace('{visible}', String(filteredUsers?.length || 0))
              .replace('{total}', String(users?.length || 0))}
            {stats.studentsAtRisk > 0 && (
              <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                {pageT.footer.attention.replace(
                  '{count}',
                  String(stats.studentsAtRisk)
                )}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
