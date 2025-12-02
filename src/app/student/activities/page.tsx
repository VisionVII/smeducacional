"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  title: string;
  courseTitle: string;
  type: "QUIZ" | "ASSIGNMENT" | "EXAM";
  status: "PENDING" | "SUBMITTED" | "GRADED";
  dueDate?: string;
  score?: number;
  maxScore?: number;
  submittedAt?: string;
}

export default function StudentActivitiesPage() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["student-activities"],
    queryFn: async () => {
      const res = await fetch("/api/student/activities");
      if (!res.ok) throw new Error("Erro ao carregar atividades");
      return res.json();
    },
  });

  const getStatusBadge = (status: Activity["status"]) => {
    const variants = {
      PENDING: { label: "Pendente", variant: "destructive" as const },
      SUBMITTED: { label: "Enviada", variant: "default" as const },
      GRADED: { label: "Corrigida", variant: "secondary" as const },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeLabel = (type: Activity["type"]) => {
    const types = {
      QUIZ: "Questionário",
      ASSIGNMENT: "Trabalho",
      EXAM: "Prova",
    };
    return types[type];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingActivities = activities?.filter((a) => a.status === "PENDING") || [];
  const completedActivities = activities?.filter((a) => a.status !== "PENDING") || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Atividades</h1>
        <p className="text-muted-foreground">
          Gerencie suas atividades, trabalhos e provas
        </p>
      </div>

      {/* Atividades Pendentes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          Pendentes ({pendingActivities.length})
        </h2>

        {pendingActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma atividade pendente
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {activity.title}
                      </CardTitle>
                      <CardDescription>
                        {activity.courseTitle} • {getTypeLabel(activity.type)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {activity.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Prazo: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <Button asChild>
                      <Link href={`/student/activities/${activity.id}`}>
                        Iniciar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Atividades Concluídas */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          Concluídas ({completedActivities.length})
        </h2>

        {completedActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma atividade concluída ainda
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedActivities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {activity.title}
                      </CardTitle>
                      <CardDescription>
                        {activity.courseTitle} • {getTypeLabel(activity.type)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      {activity.submittedAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Enviada em {new Date(activity.submittedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {activity.status === "GRADED" && activity.score !== undefined && (
                        <div className="font-semibold text-primary">
                          Nota: {activity.score}/{activity.maxScore}
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/student/activities/${activity.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
