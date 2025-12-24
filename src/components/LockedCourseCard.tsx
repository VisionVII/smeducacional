'use client';

import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDiscount } from '@/lib/feature-gating';

interface LockedCourseCardProps {
  course: {
    id: string;
    slug?: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    thumbnail?: string | null;
    description?: string;
  };
  variant?: 'card' | 'banner';
}

export function LockedCourseCard({
  course,
  variant = 'card',
}: LockedCourseCardProps) {
  // Guardar contra curso indefinido ou propriedades ausentes
  const discount = calculateDiscount(
    course?.compareAtPrice ?? null,
    course?.price ?? 0
  );

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Curso Bloqueado</h3>
              <p className="text-white/90">
                Adquira o acesso completo a este curso
              </p>
            </div>
          </div>
          <div className="text-right">
            {course?.compareAtPrice && discount > 0 && (
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-sm line-through text-white/70">
                  R$ {course?.compareAtPrice?.toFixed(2)}
                </span>
                <Badge variant="secondary" className="bg-green-500 text-white">
                  {discount}% OFF
                </Badge>
              </div>
            )}
            <div className="text-3xl font-bold mb-2">
              R$ {(course?.price ?? 0).toFixed(2)}
            </div>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90"
            >
              <Link
                href={
                  course?.slug
                    ? `/courses/${course.slug}/checkout`
                    : `/courses/${course?.id ?? ''}/checkout`
                }
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar Agora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <Lock className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Conteúdo Bloqueado</h3>
          <p className="text-white/90 mb-6">
            Adquira o curso para acessar todo o conteúdo
          </p>

          <div className="mb-6">
            {course?.compareAtPrice && discount > 0 && (
              <div className="flex items-center gap-2 justify-center mb-2">
                <span className="text-lg line-through text-white/60">
                  R$ {course?.compareAtPrice?.toFixed(2)}
                </span>
                <Badge className="bg-green-500 text-white">
                  {discount}% OFF
                </Badge>
              </div>
            )}
            <div className="text-4xl font-bold">
              R$ {(course?.price ?? 0).toFixed(2)}
            </div>
            <p className="text-sm text-white/70 mt-1">Acesso vitalício</p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-white text-gray-900 hover:bg-white/90"
          >
            <Link
              href={
                course?.slug
                  ? `/courses/${course.slug}/checkout`
                  : `/courses/${course?.id ?? ''}/checkout`
              }
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Comprar Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Thumbnail desfocado de fundo */}
      {course?.thumbnail && (
        <div
          className="h-64 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${course?.thumbnail})` }}
        />
      )}
    </Card>
  );
}
