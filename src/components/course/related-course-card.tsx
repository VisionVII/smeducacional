'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface RelatedCourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compareAtPrice: number | null;
    level: string | null;
    instructor: {
      name: string | null;
      avatar: string | null;
    };
    _count: {
      enrollments: number;
    };
  };
}

export function RelatedCourseCard({ course }: RelatedCourseCardProps) {
  const hasDiscount =
    course.compareAtPrice && course.compareAtPrice > course.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((course.compareAtPrice! - course.price) / course.compareAtPrice!) * 100
      )
    : 0;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
          {course.level && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="backdrop-blur-sm bg-background/80"
              >
                {course.level}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors min-h-[48px]">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {course.instructor.avatar ? (
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.name || 'Instrutor'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span className="text-xs">👤</span>
              )}
            </div>
            <span className="truncate">
              {course.instructor.name || 'Instrutor'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{course._count.enrollments} alunos</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  R$ {course.compareAtPrice!.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-primary">
                {course.price === 0 ? (
                  'Gratuito'
                ) : (
                  <>R$ {course.price.toFixed(2)}</>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
