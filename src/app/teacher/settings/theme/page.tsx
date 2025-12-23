import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeSelector } from '@/components/theme/theme-selector';
import { ThemeDashboard } from '@/components/theme/theme-dashboard';
import { getUserTheme } from '@/lib/themes/get-user-theme';
import type { ThemePresetId } from '@/lib/themes/presets';

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
      {/* Theme Selector */}
      <ThemeSelector currentPresetId={currentTheme.presetId as ThemePresetId} />

      {/* Painel inteligente para ajustes de UI (cartões, layout, motion) */}
      <ThemeDashboard />
    </div>
  );
}
