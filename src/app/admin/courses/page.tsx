'use client';

import { useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Search,
  Users,
  Trash2,
  Edit,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Clock,
  PlayCircle,
  BarChart3,
  Filter,
  Download,
  Star,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  teacherName: string;
  enrollmentCount: number;
  moduleCount: number;
  createdAt: string;
  // Métricas educacionais (mock data)
  completionRate?: number;
  avgRating?: number;
  activeStudents?: number;
  dropoutRate?: number;
  avgStudyTime?: number;
  performanceStatus?:
    | 'high-demand'
    | 'excellent'
    | 'needs-review'
    | 'low-engagement';
}

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  avgCompletionRate: number;
  coursesNeedingReview: number;
}

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const res = await fetch('/api/admin/courses');
      if (!res.ok) throw new Error('Erro ao carregar cursos');
      const data = await res.json();
      // Mock performance data
      return data.map((course: Course) => ({
        ...course,
        completionRate: Math.floor(Math.random() * 100),
        avgRating: (Math.random() * 2 + 3).toFixed(1),
        activeStudents: Math.floor(
          Math.random() * course.enrollmentCount * 0.8
        ),
        dropoutRate: Math.floor(Math.random() * 30),
        avgStudyTime: Math.floor(Math.random() * 20) + 5,
        performanceStatus:
          course.status === 'PUBLISHED'
            ? ['high-demand', 'excellent', 'needs-review', 'low-engagement'][
                Math.floor(Math.random() * 4)
              ]
            : undefined,
      }));
    },
  });

  // Calcular estatísticas
  const publishedCourses =
    courses?.filter((c) => c.status === 'PUBLISHED') || [];
  const stats: DashboardStats = {
    totalCourses: courses?.length || 0,
    publishedCourses: publishedCourses.length,
    totalEnrollments:
      courses?.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0) || 0,
    avgCompletionRate:
      publishedCourses.length > 0
        ? publishedCourses.reduce(
            (acc, c) => acc + (c.completionRate || 0),
            0
          ) / publishedCourses.length
        : 0,
    coursesNeedingReview:
      courses?.filter((c) => c.performanceStatus === 'needs-review').length ||
      0,
  };

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir curso');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Curso removido',
        description: 'O curso foi excluído do catálogo com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o curso. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      DRAFT: {
        label: 'Rascunho',
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
      },
      PUBLISHED: {
        label: 'Publicado',
        className:
          'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      },
      ARCHIVED: {
        label: 'Arquivado',
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
      },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: Course['level']) => {
    const variants = {
      BEGINNER: {
        label: 'Iniciante',
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      },
      INTERMEDIATE: {
        label: 'Intermediário',
        className:
          'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
      },
      ADVANCED: {
        label: 'Avançado',
        className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
      },
    };
    const config = variants[level];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPerformanceBadge = (status?: Course['performanceStatus']) => {
    if (!status) return null;

    const variants = {
      'high-demand': {
        label: 'Alta Demanda',
        icon: TrendingUp,
        className:
          'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      },
      excellent: {
        label: 'Excelente',
        icon: Award,
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      },
      'needs-review': {
        label: 'Precisa Revisão',
        icon: AlertTriangle,
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
      },
      'low-engagement': {
        label: 'Baixo Engajamento',
        icon: TrendingDown,
        className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
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

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = false;
    if (activeTab === 'all') matchesTab = true;
    else if (activeTab === 'published')
      matchesTab = course.status === 'PUBLISHED';
    else if (activeTab === 'draft') matchesTab = course.status === 'DRAFT';
    else if (activeTab === 'archived')
      matchesTab = course.status === 'ARCHIVED';

    let matchesPerformance = true;
    if (
      activeTab === 'published' &&
      performanceFilter !== 'all' &&
      course.status === 'PUBLISHED'
    ) {
      matchesPerformance = course.performanceStatus === performanceFilter;
    }

    return matchesSearch && matchesTab && matchesPerformance;
  });

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
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
              Conteúdo Educacional
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gerencie os cursos e materiais da plataforma
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/20 border-blue-200 dark:border-blue-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalCourses}
            </CardTitle>
            <CardDescription className="text-xs">
              Total de Cursos
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/20 border-green-200 dark:border-green-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.publishedCourses}
            </CardTitle>
            <CardDescription className="text-xs">Publicados</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/20 border-purple-200 dark:border-purple-900">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalEnrollments}
            </CardTitle>
            <CardDescription className="text-xs">Matrículas</CardDescription>
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
              {stats.coursesNeedingReview}
            </CardTitle>
            <CardDescription className="text-xs">
              Precisam Revisão
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs e Filtros */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="published" className="text-xs sm:text-sm">
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Publicados</span>
                  <span className="sm:hidden">Ativos</span>
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-xs sm:text-sm">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Rascunhos</span>
                  <span className="sm:hidden">Draft</span>
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Arquivados</span>
                  <span className="sm:hidden">Arq.</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </div>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, categoria ou professor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Performance */}
            {activeTab === 'published' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={performanceFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPerformanceFilter('all')}
                  className="text-xs"
                >
                  Todos
                </Button>
                <Button
                  variant={
                    performanceFilter === 'high-demand' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setPerformanceFilter('high-demand')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Alta Demanda
                </Button>
                <Button
                  variant={
                    performanceFilter === 'excellent' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setPerformanceFilter('excellent')}
                  className="text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Excelentes
                </Button>
                <Button
                  variant={
                    performanceFilter === 'needs-review' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setPerformanceFilter('needs-review')}
                  className="text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Revisão
                </Button>
                <Button
                  variant={
                    performanceFilter === 'low-engagement'
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => setPerformanceFilter('low-engagement')}
                  className="text-xs"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Baixo Engajamento
                </Button>
              </div>
            )}

            {/* Lista de Cursos */}
            <TabsContent value={activeTab} className="mt-0">
              {!filteredCourses || filteredCourses.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Nenhum curso encontrado
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Ajuste os filtros ou crie um novo curso
                  </p>
                  <Button asChild>
                    <Link href="/admin/courses/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Curso
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {filteredCourses?.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-lg transition-all duration-200 flex flex-col"
                    >
                      {course.thumbnail && (
                        <div className="relative h-36 sm:h-40 overflow-hidden rounded-t-lg">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(course.status)}
                          </div>
                        </div>
                      )}

                      <CardHeader className="p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-base line-clamp-2 mb-1">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {course.description}
                        </CardDescription>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          {getLevelBadge(course.level)}
                          {getPerformanceBadge(course.performanceStatus)}
                        </div>
                      </CardHeader>

                      {course.status === 'PUBLISHED' && (
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 flex-1">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Taxa de Conclusão
                              </span>
                              <span className="font-bold">
                                {course.completionRate}%
                              </span>
                            </div>
                            <Progress
                              value={course.completionRate}
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <Users className="h-4 w-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Alunos
                                </p>
                                <p className="text-sm font-bold">
                                  {course.enrollmentCount}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Avaliação
                                </p>
                                <p className="text-sm font-bold">
                                  {course.avgRating}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Ativos
                                </p>
                                <p className="text-sm font-bold">
                                  {course.activeStudents}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Módulos
                                </p>
                                <p className="text-sm font-bold">
                                  {course.moduleCount}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Professor:</span>
                              <span className="font-medium">
                                {course.teacherName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Categoria:</span>
                              <span className="font-medium">
                                {course.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Link href={`/courses/${course.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Link
                                href={`/admin/courses/${course.id}/analytics`}
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Dados
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteCourseMutation.mutate(course.id)
                              }
                              disabled={deleteCourseMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      )}

                      {(course.status === 'DRAFT' ||
                        course.status === 'ARCHIVED') && (
                        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 flex-1">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Professor:</span>
                              <span className="font-medium">
                                {course.teacherName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Categoria:</span>
                              <span className="font-medium">
                                {course.category}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Módulos:</span>
                              <span className="font-medium">
                                {course.moduleCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Link href={`/courses/${course.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                            >
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteCourseMutation.mutate(course.id)
                              }
                              disabled={deleteCourseMutation.isPending}
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
            <strong>{filteredCourses?.length || 0}</strong> de{' '}
            <strong>{courses?.length || 0}</strong> cursos exibidos
            {stats.coursesNeedingReview > 0 && (
              <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                • {stats.coursesNeedingReview} cursos precisam de revisão
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Taxa média de conclusão:{' '}
            <strong className="text-primary">
              {stats.avgCompletionRate.toFixed(1)}%
            </strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
