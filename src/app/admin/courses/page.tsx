"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Users, Trash2, Edit, Plus, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  teacherName: string;
  enrollmentCount: number;
  moduleCount: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Erro ao carregar cursos");
      return res.json();
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir curso");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({
        title: "Sucesso",
        description: "Curso excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: Course["status"]) => {
    const variants = {
      DRAFT: { label: "Rascunho", variant: "secondary" as const },
      PUBLISHED: { label: "Publicado", variant: "default" as const },
      ARCHIVED: { label: "Arquivado", variant: "outline" as const },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getLevelBadge = (level: Course["level"]) => {
    const labels = {
      BEGINNER: "Iniciante",
      INTERMEDIATE: "Intermediário",
      ADVANCED: "Avançado",
    };
    return <Badge variant="outline">{labels[level]}</Badge>;
  };

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Gerenciar Cursos
          </h1>
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Total de {courses?.length || 0} cursos cadastrados
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  size="sm"
                >
                  {status === "ALL"
                    ? "Todos"
                    : status === "PUBLISHED"
                    ? "Publicados"
                    : status === "DRAFT"
                    ? "Rascunhos"
                    : "Arquivados"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cursos */}
      {filteredCourses && filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros ou criar um novo curso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    {getStatusBadge(course.status)}
                    {getLevelBadge(course.level)}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-md"
                  />
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professor:</span>
                    <span className="font-medium">{course.teacherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Alunos:
                    </span>
                    <span className="font-medium">{course.enrollmentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Módulos:</span>
                    <span className="font-medium">{course.moduleCount}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourseMutation.mutate(course.id)}
                    disabled={deleteCourseMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
