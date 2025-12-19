'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemePreset } from '@/lib/themes/presets';

interface ThemeCardProps {
  preset: ThemePreset;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Card visual para preview de tema
 * Mostra cores principais e indica seleção
 */
export function ThemeCard({ preset, isSelected, onClick }: ThemeCardProps) {
  return (
    <Card
      className={cn(
        'group relative cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={onClick}
    >
      {/* Badge de seleção */}
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Gradient preview */}
      <div
        className="h-24 w-full"
        style={{
          background: preset.preview.gradient,
        }}
      />

      <CardContent className="p-4">
        {/* Nome do tema */}
        <h3 className="font-semibold text-lg mb-1">{preset.name}</h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {preset.description}
        </p>

        {/* Color swatches */}
        <div className="flex gap-2">
          <div
            className="h-8 w-8 rounded-md border shadow-sm"
            style={{ backgroundColor: preset.preview.primaryHex }}
            title="Primary"
          />
          <div
            className="h-8 w-8 rounded-md border shadow-sm"
            style={{ backgroundColor: preset.preview.secondaryHex }}
            title="Secondary"
          />
        </div>

        {/* Tags (categorias) */}
        {preset.tags && preset.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {preset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
