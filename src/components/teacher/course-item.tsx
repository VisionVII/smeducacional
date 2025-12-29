'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CourseItemProps {
  course: {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    _count: {
      modules: number;
      lessons: number;
      enrollments: number;
    };
  };
  moduleText: string;
  lessonText: string;
  enrollmentText: string;
}

export const CourseItem = memo(function CourseItem({
  course,
  moduleText,
  lessonText,
  enrollmentText,
}: CourseItemProps) {
  return (
    <div
      key={course.id}
      className="group border rounded-lg p-4 hover:border-primary/50 bg-background/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base line-clamp-1">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {course._count.modules} {moduleText} • {course._count.lessons}{' '}
            {lessonText}
          </p>
        </div>
        <Badge
          variant={course.isPublished ? 'default' : 'secondary'}
          className="ml-2 flex-shrink-0"
        >
          {course.isPublished ? 'Publicado' : 'Rascunho'}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {course._count.enrollments} {enrollmentText}
        </span>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/teacher/courses/${course.id}`}>Editar</Link>
        </Button>
      </div>
    </div>
  );
});
