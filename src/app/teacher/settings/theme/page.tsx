import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeSelector } from '@/components/theme/theme-selector';
import { getUserTheme } from '@/lib/themes/get-user-theme';
import type { ThemePresetId } from '@/lib/themes/presets';
import { Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tema Visual - Professor | SM Educacional',
  description: 'Personalize o tema visual da sua área',
};

/**
 * Página de configuração de tema para TEACHER
 * Path: /teacher/settings/theme
 */
export default async function TeacherThemePage() {
  const session = await auth();

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // Busca tema atual do professor
  const currentTheme = await getUserTheme(session.user.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tema Visual</h1>
          <p className="text-muted-foreground">
            Escolha um tema que combine com sua área de ensino
          </p>
        </div>
      </div>

      {/* Theme Selector */}
      <ThemeSelector currentPresetId={currentTheme.presetId as ThemePresetId} />
    </div>
  );
}
