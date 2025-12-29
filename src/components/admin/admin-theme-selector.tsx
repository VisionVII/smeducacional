'use client';

import { useState } from 'react';
import { ThemeCard } from '../theme/theme-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Palette, RotateCcw, AlertTriangle } from 'lucide-react';
import { useTranslatedToast } from '@/lib/translation-helpers';
import { THEME_PRESETS } from '@/lib/themes/presets';
import type { ThemePresetId } from '@/lib/themes/presets';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdminThemeSelectorProps {
  currentPresetId: ThemePresetId;
}

/**
 * Seletor de tema ADMIN que salva em SystemConfig
 * Afeta TODAS as rotas públicas e admin
 */
export function AdminThemeSelector({
  currentPresetId,
}: AdminThemeSelectorProps) {
  const toast = useTranslatedToast();
  const [selectedPreset, setSelectedPreset] =
    useState<ThemePresetId>(currentPresetId);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const hasChanges = selectedPreset !== currentPresetId;

  /**
   * Salva tema no SystemConfig (global)
   */
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/system-theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themePresetId: selectedPreset,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar tema');
      }

      toast.success('updated');

      // Reload para aplicar tema SSR
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('[AdminThemeSelector] Erro ao salvar:', error);
      toast.error('generic');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reseta tema para Academic Blue
   */
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/admin/system-theme', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao resetar tema');
      }

      toast.success('deleted');

      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('[AdminThemeSelector] Erro ao resetar:', error);
      toast.error('generic');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      <Alert className="border-2 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">
          Atenção: Tema Global do Sistema
        </AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Este tema será aplicado em <strong>todas as rotas públicas</strong>{' '}
          (home, catálogo, login), <strong>área administrativa</strong> e como{' '}
          <strong>padrão para usuários</strong> sem tema personalizado.
          Professores e alunos podem personalizar apenas suas áreas privadas.
        </AlertDescription>
      </Alert>

      <Card className="relative overflow-hidden border-2">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
        <CardHeader>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Temas Disponíveis</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting || isSaving}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              <span className="ml-2">Resetar</span>
            </Button>
          </div>
          <CardDescription>
            Escolha um tema que represente a identidade visual da sua plataforma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
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
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedPreset(currentPresetId)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-theme hover:bg-gradient-theme-soft"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Aplicar Tema Global'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
