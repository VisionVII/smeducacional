'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/video-player';
import { 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  Clock,
  BookOpen
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
  courseId: string;
  courseTitle: string;
  modules: Module[];
  currentLessonId?: string;
  progress: number;
}

export function CoursePlayer({ 
  courseId, 
  courseTitle, 
  modules, 
  currentLessonId,
  progress 
}: CoursePlayerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    currentLessonId 
      ? modules.flatMap(m => m.lessons).find(l => l.id === currentLessonId) || null
      : null
  );
  const [courseProgress, setCourseProgress] = useState(progress);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPosition, setLastPosition] = useState(0);

  // Carregar última posição quando selecionar nova aula
  useEffect(() => {
    if (selectedLesson?.id) {
      fetch(`/api/lessons/${selectedLesson.id}/progress`)
        .then(res => {
          if (!res.ok) return { progress: null };
          return res.json();
        })
        .then(data => {
          if (data?.progress) {
            setLastPosition(data.progress.lastPosition || 0);
          } else {
            setLastPosition(0);
          }
        })
        .catch(err => {
          console.error('Erro ao carregar progresso:', err);
          setLastPosition(0);
        });
    }
  }, [selectedLesson?.id]);

  const allLessons = modules.flatMap(m => m.lessons);
  const currentLessonIndex = selectedLesson 
    ? allLessons.findIndex(l => l.id === selectedLesson.id)
    : -1;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;
  const prevLesson = currentLessonIndex > 0
    ? allLessons[currentLessonIndex - 1]
    : null;

  const markAsComplete = async () => {
    if (!selectedLesson) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${selectedLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.courseProgress);
        
        // Atualizar estado local
        if (selectedLesson) {
          selectedLesson.isCompleted = true;
        }
        
        // Ir para próxima aula automaticamente
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

  const handleVideoProgress = async (watchedSeconds: number, totalSeconds: number) => {
    if (!selectedLesson) return;
    
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
    if (!selectedLesson) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${selectedLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.courseProgress);
        
        // Atualizar estado local
        if (selectedLesson) {
          selectedLesson.isCompleted = true;
        }
        
        // Ir para próxima aula automaticamente após 2 segundos
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
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/student/dashboard" 
                className="text-sm text-blue-600 hover:underline mb-2 inline-block"
              >
                ← Voltar para meus cursos
              </Link>
              <h1 className="text-2xl font-bold">{courseTitle}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Progresso do curso
              </div>
              <div className="flex items-center gap-3">
                <Progress value={courseProgress} className="w-32" />
                <span className="text-sm font-semibold">{Math.round(courseProgress)}%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completedLessons} de {totalLessons} aulas concluídas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-2">
            <Card>
              {selectedLesson ? (
                <>
                  <CardHeader>
                    <CardTitle>{selectedLesson.title}</CardTitle>
                    {selectedLesson.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {selectedLesson.description}
                      </p>
                    )}
                    {selectedLesson.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.floor(selectedLesson.duration / 60)}:
                          {String(selectedLesson.duration % 60).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedLesson.videoUrl ? (
                      <>
                        <VideoPlayer
                          url={selectedLesson.videoUrl}
                          lessonId={selectedLesson.id}
                          initialProgress={lastPosition}
                          onProgress={handleVideoProgress}
                          onComplete={handleVideoComplete}
                        />
                      </>
                    ) : (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <BookOpen className="h-16 w-16 mx-auto mb-4" />
                          <p>Conteúdo em texto</p>
                        </div>
                      </div>
                    )}

                    {selectedLesson.content && (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{selectedLesson.content}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button 
                        className="flex-1"
                        disabled={isLoading || selectedLesson.isCompleted}
                        onClick={markAsComplete}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {selectedLesson.isCompleted ? 'Aula concluída' : 'Marcar como concluída'}
                      </Button>
                      {prevLesson && (
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedLesson(prevLesson)}
                        >
                          ← Anterior
                        </Button>
                      )}
                      {nextLesson && (
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedLesson(nextLesson)}
                        >
                          Próxima →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-20 text-center">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">
                    Selecione uma aula para começar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Escolha uma aula no menu ao lado
                  </p>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conteúdo do Curso</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 text-left">
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-sm">
                            {module.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {module.lessons.filter(l => l.isCompleted).length}/
                          {module.lessons.length}
                        </span>
                      </button>

                      {expandedModules.has(module.id) && (
                        <div className="bg-gray-50 dark:bg-gray-800/50">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={cn(
                                'w-full px-4 py-3 pl-10 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left',
                                selectedLesson?.id === lesson.id && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                              )}
                            >
                              <div className="flex-shrink-0">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : lesson.isFree ? (
                                  <PlayCircle className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {lesson.title}
                                </div>
                                {lesson.duration && (
                                  <div className="text-xs text-gray-500">
                                    {Math.floor(lesson.duration / 60)}:
                                    {String(lesson.duration % 60).padStart(2, '0')}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
