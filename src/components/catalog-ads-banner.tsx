'use client';

import { useSystemBranding } from '@/hooks/use-system-branding';
import { PromotedCourseCard } from './promoted-course-card';
import { Sparkles } from 'lucide-react';

export function CatalogAdsBanner() {
  const { branding, loading } = useSystemBranding();

  if (loading || !branding?.advertisements?.length) {
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-b from-primary/5 via-background to-background border-b">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
              Cursos em Destaque
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Cursos promovidos com símbolo de anúncio
            </p>
          </div>
        </div>

        {/* Grid responsivo: 1 col mobile, 2 col tablet, 3 col desktop, 4 col large, 6 col ultra wide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6">
          {branding.advertisements.map((course) => (
            <div key={course.adId} className="w-full">
              <PromotedCourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
