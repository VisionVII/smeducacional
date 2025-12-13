'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/video-player';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  isFree: boolean;
  videoUrl: string | null;
  content: string | null;
  isCompleted?: boolean;
}

interface CoursePlayerProps {
                  <p className="text-gray-600 dark:text-gray-400">
                    Escolha uma aula no menu ao lado
                  </p>
                </CardContent>
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: true }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.courseProgress);

        if (selectedLesson) {
          selectedLesson.isCompleted = true;
        }

        if (nextLesson) {
          setSelectedLesson(nextLesson);
        }
      }
    } catch (error) {
      console.error('Erro ao marcar aula:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoProgress = async (
    watchedSeconds: number,
    totalSeconds: number
  ) => {
    if (!selectedLesson || (isCourseLocked && !selectedLesson.isFree)) return;

    try {
      await fetch(`/api/lessons/${selectedLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchTime: Math.floor(watchedSeconds),
          lastPosition: Math.floor(watchedSeconds),
          isCompleted: false,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const handleVideoComplete = async () => {
    if (!selectedLesson || (isCourseLocked && !selectedLesson.isFree)) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/lessons/${selectedLesson.id}/progress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: true }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.courseProgress);

        if (selectedLesson) {
          selectedLesson.isCompleted = true;
        }

        setTimeout(() => {
          if (nextLesson) {
            setSelectedLesson(nextLesson);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao completar aula:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.isCompleted).length,
    0
  );

  const isSelectedLessonLocked = useMemo(() => {
    if (!selectedLesson) return false;
    return isCourseLocked && !selectedLesson.isFree;
  }, [isCourseLocked, selectedLesson]);

  const handleSelectLesson = (lesson: Lesson) => {
    if (isCoursePaid && !isEnrolled && !lesson.isFree) {
      toast({
        title: 'Conteudo bloqueado',
        description: 'Compre o curso para assistir esta aula.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedLesson(lesson);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/student/dashboard"
                className="text-sm text-blue-600 hover:underline mb-2 inline-block"
              >
                Voltar para meus cursos
              </Link>
              <h1 className="text-2xl font-bold">{courseTitle}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Progresso do curso
              </div>
              <REPLACED>
                <Progress value={courseProgress} className="w-32" />
