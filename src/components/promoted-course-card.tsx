'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Award, User, Sparkles } from 'lucide-react';
import { useSystemBranding } from '@/hooks/use-system-branding';

interface PromotedCourseCardProps {
  course: NonNullable<
    ReturnType<typeof useSystemBranding>['branding']['promotedCourse']
  >;
}

export function PromotedCourseCard({ course }: PromotedCourseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isPaid = typeof course.price === 'number' && course.price > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="w-full max-w-sm cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group border-primary/20 bg-black/40 backdrop-blur-sm">
            {/* Thumbnail */}
            <div className="relative w-full h-48 overflow-hidden">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}

              {/* Sponsored Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/90 text-black hover:bg-yellow-500 border-none shadow-lg backdrop-blur-md"
                >
                  <Sparkles className="w-3 h-3 mr-1 fill-current" />
                  Patrocinado
                </Badge>
              </div>

              {/* Price Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge
                  variant={isPaid ? 'default' : 'secondary'}
                  className={
                    isPaid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-500 text-white'
                  }
                >
                  {isPaid ? `R$ ${course.price.toFixed(2)}` : 'GRATUITO'}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                {course.category && (
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/30 text-primary bg-primary/5"
                  >
                    {course.category.name}
                  </Badge>
                )}
                {course.level && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {course.level}
                  </span>
                )}
              </div>
              <CardTitle className="text-xl font-bold line-clamp-2 text-white group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              {course.instructor && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={course.instructor.avatar || undefined}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-3 w-3 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground truncate">
                    {course.instructor.name}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="pb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration ? `${course.duration}h` : '-'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course._count?.modules || 0} módulos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course._count?.enrollments || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-4xl w-full h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader className="sr-only">
            <DialogTitle>{course.title}</DialogTitle>
            <DialogDescription>Detalhes do curso promovido</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-64 md:h-80">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <div className="flex items-center gap-3 mb-4">
                {course.category && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {course.category.name}
                  </Badge>
                )}
                {course.level && (
                  <Badge
                    variant="outline"
                    className="bg-background/50 backdrop-blur text-foreground border-white/20"
                  >
                    {course.level}
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {course.title}
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground">
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage
                        src={course.instructor.avatar || undefined}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{course.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Sobre o curso
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              {course.instructor && course.instructor.bio && (
                <div className="bg-muted/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Sobre o instrutor
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">
                    {isPaid ? `R$ ${course.price.toFixed(2)}` : 'Gratuito'}
                  </CardTitle>
                  <CardDescription>Acesso vitalício</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration || 0} horas de conteúdo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{course._count?.modules || 0} módulos</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Certificado de conclusão</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-semibold" size="lg" asChild>
                    <Link href={`/courses/${course.slug}`}>
                      Matricular-se Agora
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
