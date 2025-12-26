'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AdSlotPosition =
  | 'HERO_BANNER'
  | 'SIDEBAR_TOP'
  | 'SIDEBAR_MIDDLE'
  | 'GRID_FEATURED_1'
  | 'GRID_FEATURED_2'
  | 'GRID_FEATURED_3';

type ActiveAd = {
  id: string;
  slotPosition: AdSlotPosition;
  priority: number;
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  conversions: number;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number | null;
    compareAtPrice: number | null;
    isPaid: boolean;
    isPublished: boolean;
  };
};

interface AdSlotProps {
  position: AdSlotPosition;
  className?: string;
  limit?: number;
}

export function AdSlot({ position, className, limit = 1 }: AdSlotProps) {
  const [ads, setAds] = useState<ActiveAd[]>([]);
  const sentImpressionRef = useRef<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const params = new URLSearchParams({ position, limit: String(limit) });
      const res = await fetch(`/api/ads/active?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) setAds(data.data || []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [position, limit]);

  useEffect(() => {
    if (!containerRef.current || ads.length === 0) return;

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ads.forEach((ad) => {
              if (sentImpressionRef.current[ad.id]) return;
              sentImpressionRef.current[ad.id] = true;
              fetch('/api/ads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  adId: ad.id,
                  type: 'impression',
                  position,
                }),
                keepalive: true,
              });
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ads, position]);

  const handleClick = (adId: string) => {
    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type: 'click', position }),
      keepalive: true,
    }).catch(() => {});
  };

  if (ads.length === 0) return null;

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      {ads.map((ad) => (
        <Card
          key={ad.id}
          className={cn(
            'relative overflow-hidden border-2 hover:border-primary/30 transition-colors',
            position === 'HERO_BANNER' ? 'p-0' : 'p-3'
          )}
        >
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary">Patrocinado</Badge>
          </div>

          <Link
            href={`/courses/${ad.course.slug}`}
            onClick={() => handleClick(ad.id)}
          >
            <div
              className={cn(
                'w-full',
                position === 'HERO_BANNER' ? 'h-56 sm:h-64' : 'h-36'
              )}
            >
              {ad.course.thumbnail ? (
                <div className="relative w-full h-full">
                  <Image
                    src={ad.course.thumbnail}
                    alt={ad.course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 800px"
                    priority={position === 'HERO_BANNER'}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">
                    {ad.course.title}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
