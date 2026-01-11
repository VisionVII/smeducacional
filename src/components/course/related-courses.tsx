'use client';

import { useEffect, useState } from 'react';
import { RelatedCourseCard } from './related-course-card';
import { Loader2 } from 'lucide-react';

interface RelatedCoursesProps {
  courseId: string;
  limit?: number;
}

interface RelatedCourse {
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
}

export function RelatedCourses({ courseId, limit = 4 }: RelatedCoursesProps) {
  const [courses, setCourses] = useState<RelatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/related?limit=${limit}`
        );
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Erro ao buscar cursos relacionados:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [courseId, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span>🔥</span>
          <span>Os alunos também compraram</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <RelatedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
