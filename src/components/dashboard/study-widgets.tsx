'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Flame, TrendingUp } from 'lucide-react';

export interface StudyContinuityWidgetProps {
  currentStreak?: number;
  totalStudyHours?: number;
  nextMilestone?: number;
}

export function StudyContinuityWidget({
  currentStreak = 0,
  totalStudyHours = 0,
  nextMilestone = 10,
}: StudyContinuityWidgetProps) {
  const streakPercentage = Math.min((currentStreak / 30) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Estudo Contínuo
        </CardTitle>
        <CardDescription>Mantenha sua sequência de estudos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              Sequência Atual
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {currentStreak} dias
            </p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Total de Horas
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {totalStudyHours}h
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">
              Progresso para {nextMilestone} dias
            </p>
            <p className="text-xs text-muted-foreground">
              {currentStreak} / {nextMilestone}
            </p>
          </div>
          <Progress value={streakPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            💡 Dica: Estude todos os dias para manter sua sequência!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export interface ProgressWidgetProps {
  totalCourses?: number;
  completedCourses?: number;
  avgProgress?: number;
}

export function ProgressWidget({
  totalCourses = 0,
  completedCourses = 0,
  avgProgress = 0,
}: ProgressWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Seu Progresso
        </CardTitle>
        <CardDescription>Resumo de seus cursos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              Cursos Concluídos
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
              {completedCourses} / {totalCourses}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Progresso Médio
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {avgProgress}%
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Progresso Geral</p>
            <p className="text-xs text-muted-foreground">{avgProgress}%</p>
          </div>
          <Progress value={avgProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            📊 Você está progredindo bem! Continue assim!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
