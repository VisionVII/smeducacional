'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { THEME_PRESETS } from '@/lib/theme-presets';

const ADMIN_THEME_ENDPOINT = '/api/admin/public-site';

export default function PublicThemePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('default');

  const currentPreset = useMemo(
    () => THEME_PRESETS.find((p) => p.id === selectedId) ?? THEME_PRESETS[0],
    [selectedId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(ADMIN_THEME_ENDPOINT, { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar tema público');
        const { data } = await res.json();
        const themeName = data?.theme?.themeName as string | undefined;
        if (themeName) {
          const preset = THEME_PRESETS.find((p) => p.name === themeName);
          if (preset) setSelectedId(preset.id);
        }
      } catch (error) {
        console.error('[admin-public-theme] load', error);
        toast({
          title: 'Erro ao carregar',
          description: 'Não foi possível carregar o tema público.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const handleSave = async () => {
    if (!currentPreset) return;
    try {
      setSaving(true);
      const res = await fetch(ADMIN_THEME_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: {
            palette: currentPreset.palette,
            layout: currentPreset.layout,
            animations: currentPreset.animations ?? null,
            themeName: currentPreset.name,
          },
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Erro ao salvar');
      }

      toast({ title: 'Tema salvo', description: 'Tema público atualizado.' });
    } catch (error) {
      console.error('[admin-public-theme] save', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique a conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Tema das Páginas Públicas</h1>
        <p className="text-muted-foreground">
          Selecione o tema global aplicado às páginas públicas. O menu do
          usuário logado mantém as cores do próprio perfil; somente o conteúdo
          público usa o tema definido aqui.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Escolher tema</CardTitle>
          <CardDescription>
            Escolha um preset ou salve um existente como tema público padrão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <>
              <Select
                value={selectedId}
                onValueChange={(value) => setSelectedId(value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_PRESETS.filter((preset) => preset.id && preset.id !== '').map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ThemePreview
                presetName={currentPreset.name}
                palette={currentPreset.palette}
              />

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar tema público'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Aplicado imediatamente às páginas públicas.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ThemePreview({
  presetName,
  palette,
}: {
  presetName: string;
  palette: { [k: string]: string };
}) {
  const gradient = `linear-gradient(135deg, hsl(${palette.primary}) 0%, hsl(${palette.secondary}) 100%)`;
  return (
    <div className="rounded-lg border p-4 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Preview rápido</p>
          <p className="font-semibold">{presetName}</p>
        </div>
        <div
          className={cn('h-12 w-28 rounded-md border')}
          style={{ background: gradient }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(palette)
          .slice(0, 5)
          .map(([key, value]) => (
            <div key={key} className="rounded-md border p-2 text-xs">
              <div
                className="h-8 w-full rounded"
                style={{ background: `hsl(${value})` }}
              />
              <p className="mt-1 truncate text-muted-foreground">{key}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
