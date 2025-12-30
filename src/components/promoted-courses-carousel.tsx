'use client';

import { useSystemBranding } from '@/hooks/use-system-branding';
import { PromotedCourseCard } from './promoted-course-card';
import { Sparkles } from 'lucide-react';

export function PromotedCoursesCarousel() {
  const { branding, loading } = useSystemBranding();

  if (loading || !branding?.advertisements?.length) {
    return null;
  }

  return (
    <div className="w-full space-y-6 py-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Cursos em Destaque
          </h3>
          <p className="text-xs text-muted-foreground">
            Cursos promovidos com símbolo de anúncio
          </p>
        </div>
      </div>

      {/* Mobile: Carousel / Desktop: Grid */}
      <div
        className="
        flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4
        md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0
        scrollbar-hide
      "
      >
        {branding.advertisements.map((course) => (
          <div
            key={course.adId}
            className="min-w-[85vw] sm:min-w-[350px] snap-center md:min-w-0"
          >
            <PromotedCourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}
