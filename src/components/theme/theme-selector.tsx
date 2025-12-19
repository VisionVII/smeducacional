'use client';

import { useState, useEffect } from 'react';
import { ThemeCard } from './theme-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Palette, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { THEME_PRESETS } from '@/lib/themes/presets';
import type { ThemePresetId } from '@/lib/themes/presets';

interface ThemeSelectorProps {
  currentPresetId?: ThemePresetId;
  onThemeChange?: () => void;
}

/**
 * Componente principal de seleção de temas
 * Usado em admin/teacher/student settings
 */
export function ThemeSelector({
  currentPresetId = 'academic-blue',
  onThemeChange,
}: ThemeSelectorProps) {
  const [selectedPreset, setSelectedPreset] =
    useState<ThemePresetId>(currentPresetId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Atualiza seleção quando currentPresetId muda
  useEffect(() => {
    setSelectedPreset(currentPresetId);
  }, [currentPresetId]);

  const hasChanges = selectedPreset !== currentPresetId;

  /**
   * Salva tema selecionado via API
   */
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: selectedPreset,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar tema');
      }

      toast({
        title: 'Tema atualizado!',
        description: 'Suas preferências foram salvas com sucesso.',
      });

      // Recarrega página para aplicar tema SSR
      setTimeout(() => window.location.reload(), 500);

      onThemeChange?.();
    } catch (error) {
      console.error('[ThemeSelector] Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar tema',
        description:
          error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reseta tema para Academic Blue
   */
  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/theme', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao resetar tema');
      }

      toast({
        title: 'Tema resetado!',
        description: 'Voltando para Academic Blue...',
      });

      setTimeout(() => window.location.reload(), 500);

      onThemeChange?.();
    } catch (error) {
      console.error('[ThemeSelector] Erro ao resetar:', error);
      toast({
        title: 'Erro ao resetar tema',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Tema Visual</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || isSaving}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span className="ml-2">Resetar</span>
          </Button>
        </div>
        <CardDescription>
          Escolha um tema que combine com sua área de atuação
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Grid de temas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_PRESETS.map((preset) => (
            <ThemeCard
              key={preset.id}
              preset={preset}
              isSelected={selectedPreset === preset.id}
              onClick={() => setSelectedPreset(preset.id)}
            />
          ))}
        </div>

        {/* Botão de salvar */}
        {hasChanges && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPreset(currentPresetId)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Aplicar Tema'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
