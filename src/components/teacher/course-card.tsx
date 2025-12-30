import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Video, Eye, Edit, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Translation } from '@/components/translations-provider';

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
  t?: Translation;
  mounted?: boolean;
}

export function CourseCard({ course, t, mounted }: CourseCardProps) {
  const totalLessons =
    course.lessonCount ??
    course.modules?.reduce((acc, m) => acc + m._count.lessons, 0) ??
    0;
  const isPaid = typeof course.price === 'number' && course.price > 0;

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
            {course.isPublished
              ? mounted && t
                ? t.dashboard.teacher.published
                : 'Publicado'
              : mounted && t
              ? t.dashboard.teacher.draft
              : 'Rascunho'}
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
              {course._count.modules}{' '}
              {mounted && t ? t.dashboard.teacher.modulesLabel : 'módulos'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-md">
            <Video className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {totalLessons}{' '}
              {mounted && t ? t.dashboard.teacher.lessonsLabel : 'aulas'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-md">
            <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {course._count.enrollments}{' '}
              {mounted && t ? t.dashboard.teacher.studentsLabel : 'alunos'}
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
              {mounted && t ? t.dashboard.teacher.free : 'Gratuito'}
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
            >
              <Link href={`/courses/${course.slug}`} target="_blank">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">
                  {mounted && t ? t.dashboard.teacher.view : 'Ver'}
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full hover:bg-primary/10 hover:border-primary transition-colors"
            >
              <Link href={`/teacher/courses/${course.id}/edit`}>
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">
                  {mounted && t ? t.dashboard.teacher.edit : 'Editar'}
                </span>
              </Link>
            </Button>
          </div>
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-theme text-white hover:opacity-90 transition-opacity"
          >
            <Link href={`/teacher/courses/${course.id}/content`}>
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-semibold">
                {mounted && t
                  ? t.dashboard.teacher.content
                  : 'Gerenciar Conteúdo'}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
