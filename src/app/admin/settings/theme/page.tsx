import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Palette } from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ThemePresetId } from '@/lib/themes/presets';
import { AdminThemeSelector } from '@/components/admin/admin-theme-selector';

export const metadata: Metadata = {
  title: 'Tema do Sistema - Admin | SM Educacional',
  description: 'Configure o tema visual global da plataforma',
};

/**
 * Página de configuração de tema ADMIN
 * Path: /admin/settings/theme
 *
 * IMPORTANTE: Este tema afeta:
 * - Todas as rotas públicas (/, /courses, /login, etc.)
 * - Toda a área administrativa (/admin/*)
 * - Fallback para teacher/student (se não tiverem tema próprio)
 */
export default async function AdminThemePage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Busca tema atual do sistema (SystemConfig)
  const systemConfig = await prisma.systemConfig.findFirst();
  const currentThemeId =
    (systemConfig?.themePresetId as ThemePresetId) || 'academic-blue';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1800px]">
        {/* Header Premium */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tema Global do Sistema
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Este tema será aplicado em todas as rotas públicas, área
                  administrativa e como padrão para usuários sem tema
                  personalizado
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Seletor de Temas */}
        <AdminThemeSelector currentPresetId={currentThemeId} />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                Rotas Públicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Home, Catálogo, Login, Registro
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Área Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Dashboard, Usuários, Cursos, Config
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                Fallback Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Teacher/Student sem tema próprio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
