"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, BookOpen, Award } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessAt?: string;
}

export default function TeacherCourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["teacher-course-students", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/courses/${courseId}/students`);
      if (!res.ok) throw new Error("Erro ao carregar alunos");
      return res.json();
    },
  });

  const { data: courseInfo } = useQuery({
    queryKey: ["teacher-course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (!res.ok) throw new Error("Erro ao carregar curso");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Alunos do Curso</h1>
        <p className="text-muted-foreground">
          {courseInfo?.title || "Carregando..."}
        </p>
        <div className="flex gap-4 mt-4">
          <Badge variant="secondary" className="text-base px-4 py-1">
            <Users className="h-4 w-4 mr-2" />
            {students?.length || 0} alunos
          </Badge>
        </div>
      </div>

      {students && students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno matriculado</h3>
            <p className="text-muted-foreground text-center">
              Ainda não há alunos matriculados neste curso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {students?.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/messages?student=${student.id}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Mensagem
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="text-2xl font-bold">{student.progress}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Aulas Concluídas
                    </p>
                    <p className="text-2xl font-bold">
                      {student.completedLessons}/{student.totalLessons}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Matrícula</p>
                    <p className="text-sm font-medium">
                      {new Date(student.enrolledAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Último Acesso</p>
                    <p className="text-sm font-medium">
                      {student.lastAccessAt
                        ? new Date(student.lastAccessAt).toLocaleDateString('pt-BR')
                        : "Nunca"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
