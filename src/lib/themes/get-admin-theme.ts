import { prisma } from '@/lib/db';
import { getPresetById } from './presets';
import type { ThemeColors, ThemePresetId, ThemePreset } from './presets';

/**
 * Busca o preset completo do tema global do sistema (SystemConfig)
 *
 * Este tema é usado para:
 * - Todas as rotas públicas (/, /courses, /login, etc.)
 * - Área administrativa (/admin/*)
 * - Fallback quando teacher/student não têm tema próprio
 *
 * @returns {Promise<ThemePreset>} Preset completo (light + dark)
 */
export async function getAdminThemePreset(): Promise<ThemePreset> {
  try {
    // Busca SystemConfig do banco
    const systemConfig = await prisma.systemConfig.findFirst({
      select: {
        themePresetId: true,
      },
    });

    const presetId =
      (systemConfig?.themePresetId as ThemePresetId) || 'academic-blue';

    // Busca preset das cores
    const preset = getPresetById(presetId);

    if (!preset) {
      console.warn(
        `[getAdminThemePreset] Preset "${presetId}" não encontrado, usando academic-blue`
      );
      return getPresetById('academic-blue')!;
    }

    return preset;
  } catch (error) {
    console.error('[getAdminThemePreset] Erro ao buscar tema global:', error);
    return getPresetById('academic-blue')!;
  }
}

/**
 * Busca o tema global do sistema (SystemConfig)
 * @deprecated Use getAdminThemePreset() para obter light + dark
 * @returns {Promise<ThemeColors>} Cores do tema global (apenas light)
 */
export async function getAdminTheme(): Promise<ThemeColors> {
  const preset = await getAdminThemePreset();
  return preset.light;
}

/**
 * Resolve tema baseado em hierarquia:
 * - Rotas públicas → Tema admin
 * - Rotas admin → Tema admin
 * - Rotas teacher/student → Tema usuário (com fallback para admin)
 *
 * @param pathname - Caminho da rota atual
 * @param userId - ID do usuário logado (opcional)
 * @param role - Role do usuário (opcional)
 * @returns {Promise<ThemeColors>} Cores do tema resolvido
 */
export async function resolveThemeForRoute(
  pathname: string,
  userId?: string,
  role?: string
): Promise<ThemeColors> {
  // Rotas públicas sempre usam tema admin
  const publicRoutes = ['/', '/courses', '/login', '/register', '/about'];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (isPublicRoute || pathname.startsWith('/admin')) {
    return getAdminTheme();
  }

  // Se usuário não está logado, usa tema admin
  if (!userId || !role) {
    return getAdminTheme();
  }

  // Teacher/Student: tenta buscar tema próprio
  try {
    const userTheme = await prisma.userTheme.findUnique({
      where: { userId },
      select: { presetId: true },
    });

    if (userTheme?.presetId) {
      const preset = getPresetById(userTheme.presetId as ThemePresetId);
      if (preset) {
        return preset.light;
      }
    }

    // Se não tem tema próprio, usa tema admin (fallback)
    return getAdminTheme();
  } catch (error) {
    console.error('[resolveThemeForRoute] Erro ao resolver tema:', error);
    return getAdminTheme();
  }
}
