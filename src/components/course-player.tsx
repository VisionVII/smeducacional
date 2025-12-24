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
  courseId: string;
  courseTitle: string;
  courseSlug?: string;
  modules: Module[];
  isEnrolled: boolean;
  isCoursePaid: boolean;
}

export function CoursePlayer({
  courseId,
  courseTitle,
  courseSlug,
  modules,
  isEnrolled,
  isCoursePaid,
}: CoursePlayerProps) {
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [courseProgress, setCourseProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProgress, setIsFetchingProgress] = useState(true);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isSigningUrl, setIsSigningUrl] = useState(false);

  const isCourseLocked = isCoursePaid && !isEnrolled;

  useEffect(() => {
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      setSelectedLesson(modules[0].lessons[0]);
      setExpandedModules(new Set([modules[0].id]));
    }
  }, [modules]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setCourseProgress(data.progress || 0);

          if (data.lessonsProgress) {
            modules.forEach((module) => {
              module.lessons.forEach((lesson) => {
                const progress = data.lessonsProgress.find(
                  (p: any) => p.lessonId === lesson.id
                );
                if (progress?.isCompleted) {
                  lesson.isCompleted = true;
                }
              });
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar progresso:', error);
      } finally {
        setIsFetchingProgress(false);
      }
    };

    if (isEnrolled) {
      fetchProgress();
    } else {
      setIsFetchingProgress(false);
    }
  }, [courseId, isEnrolled, modules]);

  const allLessons = useMemo(() => {
    return modules.flatMap((m) => m.lessons).sort((a, b) => a.order - b.order);
  }, [modules]);

  const currentLessonIndex = useMemo(() => {
    if (!selectedLesson) return -1;
    return allLessons.findIndex((l) => l.id === selectedLesson.id);
  }, [selectedLesson, allLessons]);

  const previousLesson = useMemo(() => {
    if (currentLessonIndex <= 0) return null;
    return allLessons[currentLessonIndex - 1];
  }, [currentLessonIndex, allLessons]);

  const nextLesson = useMemo(() => {
    if (
      currentLessonIndex === -1 ||
      currentLessonIndex >= allLessons.length - 1
    )
      return null;
    return allLessons[currentLessonIndex + 1];
  }, [currentLessonIndex, allLessons]);

  // Resolve URL assinada quando a aula for do Supabase
  useEffect(() => {
    let isMounted = true;
    const resolveUrl = async () => {
      if (!selectedLesson?.videoUrl) {
        if (isMounted) setPlaybackUrl(null);
        return;
      }

      const url = selectedLesson.videoUrl;
      const isSupabase = url.includes('supabase.co');

      // URLs externas (YouTube/Vimeo) ou http(s) não-Supabase vão direto
      if (!isSupabase) {
        if (isMounted) setPlaybackUrl(url);
        return;
      }

      setIsSigningUrl(true);
      try {
        const response = await fetch(
          `/api/lessons/${selectedLesson.id}/signed-url`
        );
        if (!response.ok) {
          console.error('Erro ao obter URL assinada');
          if (isMounted) setPlaybackUrl(url); // fallback
          return;
        }
        const data = await response.json();
        const signed = data?.data?.signedUrl;
        if (signed && isMounted) {
          setPlaybackUrl(signed);
        } else if (isMounted) {
          setPlaybackUrl(url);
        }
      } catch (error) {
        console.error('Erro ao resolver URL assinada:', error);
        if (isMounted) setPlaybackUrl(url);
      } finally {
        if (isMounted) setIsSigningUrl(false);
      }
    };

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [selectedLesson]);

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
        title: 'Conteúdo bloqueado',
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
              <div className="flex items-center gap-2">
                <Progress value={courseProgress} className="w-32" />
                <span className="text-sm font-semibold">
                  {Math.round(courseProgress)}%
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completedLessons} de {totalLessons} aulas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {!selectedLesson ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Escolha uma aula no menu ao lado
                    </p>
                  </div>
                ) : (
                  <>
                    {isSelectedLessonLocked ? (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6 text-center">
                        <Lock className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Conteúdo bloqueado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Compre o curso para acessar esta aula
                        </p>
                        <Button asChild>
                          <Link
                            href={
                              courseSlug
                                ? `/courses/${courseSlug}`
                                : `/student/courses/${courseId}`
                            }
                          >
                            Ver detalhes do curso
                          </Link>
                        </Button>
                      </div>
                    ) : selectedLesson.videoUrl ? (
                      playbackUrl ? (
                        <VideoPlayer
                          url={playbackUrl}
                          lessonId={selectedLesson.id}
                          onProgress={handleVideoProgress}
                          onComplete={handleVideoComplete}
                        />
                      ) : (
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <p className="text-gray-600 dark:text-gray-400">
                            {isSigningUrl
                              ? 'Gerando acesso ao vídeo...'
                              : 'Preparando vídeo...'}
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          Vídeo não disponível
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {selectedLesson && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedLesson.title}</CardTitle>
                    {selectedLesson.duration && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {Math.floor(selectedLesson.duration / 60)} min
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedLesson.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {selectedLesson.description}
                    </p>
                  )}
                  {selectedLesson.content && (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedLesson.content,
                      }}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-4">
                    ⚠️ Conteúdo fornecido pelo instrutor do curso
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                disabled={!previousLesson || isLoading}
                onClick={() =>
                  previousLesson && setSelectedLesson(previousLesson)
                }
                aria-label="Aula anterior"
              >
                Anterior
              </Button>
              <Button
                disabled={!nextLesson || isLoading}
                onClick={() => nextLesson && setSelectedLesson(nextLesson)}
                aria-label="Próxima aula"
              >
                Próxima
              </Button>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Conteúdo do curso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isFetchingProgress ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-full ml-4" />
                        <Skeleton className="h-8 w-full ml-4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {modules?.map((module) => (
                      <div key={module.id}>
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-semibold text-left">
                              {module.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {module.lessons.filter((l) => l.isCompleted).length}
                            /{module.lessons.length}
                          </span>
                        </button>

                        {expandedModules.has(module.id) && (
                          <div className="bg-gray-50 dark:bg-gray-900">
                            {module.lessons?.map((lesson) => {
                              const isLocked =
                                isCoursePaid && !isEnrolled && !lesson.isFree;
                              const isActive = selectedLesson?.id === lesson.id;

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleSelectLesson(lesson)}
                                  disabled={isLocked}
                                  className={cn(
                                    'w-full px-4 py-3 pl-8 flex items-center gap-3 text-left transition-colors',
                                    isActive
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                                    isLocked && 'opacity-60 cursor-not-allowed'
                                  )}
                                >
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  ) : isLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <PlayCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {lesson.title}
                                    </p>
                                    {lesson.duration && (
                                      <p className="text-xs text-gray-500">
                                        {Math.floor(lesson.duration / 60)} min
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
