import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface TopCoursesWidgetProps {
  courses: Array<{
    id: string;
    title: string;
    thumbnail: string | null;
    _count: {
      enrollments: number;
    };
  }>;
}

export function TopCoursesWidget({ courses }: TopCoursesWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Top 5 Cursos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum curso disponível
            </p>
          ) : (
            courses?.map((course, index) => (
              <Link
                key={course.id}
                href={`/admin/courses/${course.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {index + 1}º
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {course._count.enrollments}{' '}
                      {course._count.enrollments === 1 ? 'aluno' : 'alunos'}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
