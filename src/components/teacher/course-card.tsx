'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Video,
  Eye,
  Edit,
  Settings,
  Archive,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    isPublished: boolean;
    price: number | null;
    compareAtPrice: number | null;
    level: string | null;
    lessonCount?: number;
    category?: {
      name: string;
    } | null;
    _count: {
      enrollments: number;
      modules: number;
    };
    modules?: Array<{
      _count: {
        lessons: number;
      };
    }>;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const totalLessons =
    course.lessonCount ??
    course.modules?.reduce((acc, m) => acc + m._count.lessons, 0) ??
    0;
  const isPaid = typeof course.price === 'number' && course.price > 0;

  const handleArchiveToggle = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch(
        `/api/teacher/courses/${course.id}/archive`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: !course.isPublished }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar curso');
      }

      toast({
        title: course.isPublished ? 'Curso arquivado' : 'Curso republicado',
        description: course.isPublished
          ? 'O curso foi arquivado e não está mais visível para novos alunos.'
          : 'O curso foi republicado e está disponível novamente.',
      });

      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      toast({
        title: 'Erro ao atualizar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar o curso. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
      setIsArchiveDialogOpen(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-primary/30 bg-gradient-to-br from-card via-card to-muted/20 h-full">
      {/* Barra superior decorativa */}
      <div className="h-1 bg-gradient-theme" />

      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-muted to-muted/50">
        {course.thumbnail ? (
          <>
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        {/* Badge de status */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={course.isPublished ? 'default' : 'secondary'}
            className="text-xs font-semibold shadow-lg backdrop-blur-sm"
          >
            {course.isPublished ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Título */}
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-md">
            <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {course._count.modules} módulos
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-md">
            <Video className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {totalLessons} aulas
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-md">
            <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {course._count.enrollments} alunos
            </span>
          </div>
          {course.level && (
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          )}
        </div>

        {/* Preço */}
        <div className="pt-3 border-t">
          {isPaid ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-green-600 dark:text-green-500">
                R$ {course.price?.toFixed(2)}
              </span>
              {course.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  R$ {course.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xl font-bold text-blue-600 dark:text-blue-500">
              Gratuito
            </span>
          )}
        </div>

        {/* Ações - sempre no final */}
        <div className="flex flex-col gap-2 mt-auto pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full hover:bg-primary/10 hover:border-primary transition-colors"
              title={
                course.isPublished
                  ? 'Ver página pública'
                  : 'Pré-visualizar (curso não publicado)'
              }
            >
              <Link
                href={
                  course.isPublished
                    ? `/courses/${course.slug}`
                    : `/teacher/courses/${course.id}/edit`
                }
                target={course.isPublished ? '_blank' : undefined}
                suppressHydrationWarning
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Ver</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full hover:bg-primary/10 hover:border-primary transition-colors"
            >
              <Link
                href={`/teacher/courses/${course.id}/edit`}
                suppressHydrationWarning
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Editar</span>
              </Link>
            </Button>
          </div>
          <Button
            variant={course.isPublished ? 'outline' : 'default'}
            size="sm"
            className="w-full transition-colors"
            onClick={() => setIsArchiveDialogOpen(true)}
            disabled={isArchiving}
          >
            {course.isPublished ? (
              <>
                <Archive className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-semibold">Arquivar Curso</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-semibold">Republicar Curso</span>
              </>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-theme text-white hover:opacity-90 transition-opacity"
          >
            <Link
              href={`/teacher/courses/${course.id}/content`}
              suppressHydrationWarning
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-semibold">Gerenciar Conteúdo</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {course.isPublished ? (
                <Archive className="h-5 w-5 text-orange-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-green-500" />
              )}
              {course.isPublished ? 'Arquivar Curso' : 'Republicar Curso'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  {course.isPublished ? (
                    <>
                      Tem certeza que deseja arquivar o curso{' '}
                      <strong>&ldquo;{course.title}&rdquo;</strong>?
                    </>
                  ) : (
                    <>
                      Tem certeza que deseja republicar o curso{' '}
                      <strong>&ldquo;{course.title}&rdquo;</strong>?
                    </>
                  )}
                </p>
                {course.isPublished ? (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      📦 O curso ficará invisível para novos alunos, mas os
                      alunos já matriculados continuarão tendo acesso ao
                      conteúdo.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ O curso voltará a ficar visível para novos alunos e
                      aparecerá na plataforma.
                    </p>
                  </div>
                )}
                {course._count.enrollments > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      👥 Este curso possui {course._count.enrollments} aluno(s)
                      matriculado(s).
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
              disabled={isArchiving}
            >
              Cancelar
            </Button>
            <Button
              variant={course.isPublished ? 'default' : 'default'}
              onClick={handleArchiveToggle}
              disabled={isArchiving}
            >
              {isArchiving
                ? 'Processando...'
                : course.isPublished
                ? 'Sim, Arquivar'
                : 'Sim, Republicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
