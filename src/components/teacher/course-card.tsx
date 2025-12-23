import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Video, Eye, Edit, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    category?: {
      name: string;
    } | null;
    _count: {
      enrollments: number;
      modules: number;
    };
    modules: Array<{
      _count: {
        lessons: number;
      };
    }>;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m._count.lessons,
    0
  );
  const isPaid = typeof course.price === 'number' && course.price > 0;

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border-2 hover:border-primary/30 bg-gradient-to-br from-card via-card to-muted/20">
      {/* Barra superior decorativa com gradiente do tema */}
      <div className="h-1.5 bg-gradient-theme" />

      <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6 lg:p-7">
        {/* Thumbnail com efeitos */}
        <div className="flex-shrink-0 w-full sm:w-52 lg:w-56">
          {course.thumbnail ? (
            <div className="relative w-full sm:w-52 lg:w-56 h-36 sm:h-32 lg:h-36 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 224px"
              />

              {/* Badge de status sobreposto */}
              <div className="absolute top-3 right-3 z-20">
                <Badge
                  variant={course.isPublished ? 'default' : 'secondary'}
                  className="text-xs shadow-lg backdrop-blur-sm"
                >
                  {course.isPublished ? '✓ Publicado' : '○ Rascunho'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="w-full sm:w-52 lg:w-56 h-36 sm:h-32 lg:h-36 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
              <BookOpen className="h-14 w-14 text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Título e Categoria */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {course.title}
              </h3>
              {!course.thumbnail && (
                <Badge
                  variant={course.isPublished ? 'default' : 'secondary'}
                  className="text-xs flex-shrink-0"
                >
                  {course.isPublished ? '✓ Publicado' : '○ Rascunho'}
                </Badge>
              )}
            </div>

            {course.description && (
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Meta Info com design aprimorado */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {course._count.modules} módulos
              </span>
            </span>
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Video className="h-4 w-4 text-primary" />
              <span className="font-medium">{totalLessons} aulas</span>
            </span>
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {course._count.enrollments} alunos
              </span>
            </span>
            {course.level && (
              <Badge variant="outline" className="text-xs font-semibold">
                {course.level}
              </Badge>
            )}
          </div>

          {/* Preço com destaque */}
          <div className="pt-2 border-t">
            <span className="font-bold text-lg">
              {isPaid ? (
                <span className="text-green-600 dark:text-green-500">
                  R$ {course.price?.toFixed(2)}
                  {course.compareAtPrice && (
                    <span className="ml-3 text-sm text-muted-foreground line-through font-normal">
                      R$ {course.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-500">
                  Gratuito
                </span>
              )}
            </span>
          </div>

          {/* Ações com design moderno */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              <Link href={`/courses/${course.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              <Link href={`/teacher/courses/${course.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="flex-1 sm:flex-initial bg-gradient-theme text-white hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/teacher/courses/${course.id}/content`}>
                <Settings className="h-4 w-4 mr-2" />
                Conteúdo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
