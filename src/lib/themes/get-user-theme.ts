/**
 * ============================================
 * GET USER THEME - SERVER-SIDE HELPER
 * ============================================
 *
 * Função server-side para buscar tema do usuário.
 * Usado em middleware, server components e API routes.
 *
 * IMPORTANTE: Se usuário não tem tema próprio, faz fallback
 * ao tema global do admin (SystemConfig.themePresetId)
 */

import { prisma } from '@/lib/db';
import { getPresetById, getDefaultPreset } from './presets';
import type { ThemePreset, ThemePresetId } from './presets';

export interface UserThemeData {
  presetId: string;
  preset: ThemePreset;
  cardStyle: string;
  cardShadow: string;
  cardBorder: boolean;
  card3D: boolean;
  cardGlass: boolean;
  spacing: string;
  borderRadius: string;
  animationsEnabled: boolean;
  animationSpeed: string;
  hoverEffects: boolean;
  fontSize: string;
}

/**
 * Busca tema do usuário no banco
 * Se não existir, cria um tema padrão DIFERENTE do admin
 * (evita que teacher/student herdem tema admin)
 */
export async function getUserTheme(userId: string): Promise<UserThemeData> {
  try {
    const userTheme = await prisma.userTheme.findUnique({
      where: { userId },
    });

    // Se não tem tema customizado, usa preset padrão independente (NÃO o admin theme)
    if (!userTheme) {
      console.log(
        `[getUserTheme] Usuário ${userId} sem tema customizado, usando forest-green padrão`
      );

      // USA PRESET DIFERENTE DO ADMIN (forest-green ao invés de pegar o admin theme)
      const defaultPresetId: ThemePresetId = 'forest-green';
      const preset = getPresetById(defaultPresetId) || getDefaultPreset();

      return {
        presetId: defaultPresetId,
        preset,
        cardStyle: 'FLAT',
        cardShadow: 'NONE',
        cardBorder: true,
        card3D: false,
        cardGlass: false,
        spacing: 'COMFORTABLE',
        borderRadius: '0.5rem',
        animationsEnabled: true,
        animationSpeed: 'NORMAL',
        hoverEffects: true,
        fontSize: 'NORMAL',
      };
    }

    // Busca preset correspondente
    const preset =
      getPresetById(userTheme.presetId as ThemePresetId) || getDefaultPreset();

    return {
      presetId: userTheme.presetId,
      preset,
      cardStyle: userTheme.cardStyle,
      cardShadow: userTheme.cardShadow,
      cardBorder: userTheme.cardBorder,
      card3D: userTheme.card3D,
      cardGlass: userTheme.cardGlass,
      spacing: userTheme.spacing,
      borderRadius: userTheme.borderRadius,
      animationsEnabled: userTheme.animationsEnabled,
      animationSpeed: userTheme.animationSpeed,
      hoverEffects: userTheme.hoverEffects,
      fontSize: userTheme.fontSize,
    };
  } catch (error) {
    console.error('[getUserTheme] Erro ao buscar tema:', error);

    // Fallback: busca tema global ou usa academic-blue
    try {
      const systemConfig = await prisma.systemConfig.findFirst({
        select: { themePresetId: true },
      });
      const fallbackPresetId =
        (systemConfig?.themePresetId as ThemePresetId) || 'academic-blue';
      const preset = getPresetById(fallbackPresetId) || getDefaultPreset();

      return {
        presetId: fallbackPresetId,
        preset,
        cardStyle: 'FLAT',
        cardShadow: 'NONE',
        cardBorder: true,
        card3D: false,
        cardGlass: false,
        spacing: 'COMFORTABLE',
        borderRadius: '0.5rem',
        animationsEnabled: true,
        animationSpeed: 'NORMAL',
        hoverEffects: true,
        fontSize: 'NORMAL',
      };
    } catch (fallbackError) {
      console.error('[getUserTheme] Erro no fallback:', fallbackError);
      const defaultPreset = getDefaultPreset();
      return {
        presetId: 'academic-blue',
        preset: defaultPreset,
        cardStyle: 'FLAT',
        cardShadow: 'NONE',
        cardBorder: true,
        card3D: false,
        cardGlass: false,
        spacing: 'COMFORTABLE',
        borderRadius: '0.5rem',
        animationsEnabled: true,
        animationSpeed: 'NORMAL',
        hoverEffects: true,
        fontSize: 'NORMAL',
      };
    }
  }
}

/**
 * Cria tema padrão para novo usuário
 */
export async function createDefaultTheme(
  userId: string
): Promise<UserThemeData> {
  try {
    const userTheme = await prisma.userTheme.create({
      data: {
        userId,
        presetId: 'academic-blue',
        // Defaults já definidos no Prisma schema
      },
    });

    const preset = getDefaultPreset();

    return {
      presetId: userTheme.presetId,
      preset,
      cardStyle: userTheme.cardStyle,
      cardShadow: userTheme.cardShadow,
      cardBorder: userTheme.cardBorder,
      card3D: userTheme.card3D,
      cardGlass: userTheme.cardGlass,
      spacing: userTheme.spacing,
      borderRadius: userTheme.borderRadius,
      animationsEnabled: userTheme.animationsEnabled,
      animationSpeed: userTheme.animationSpeed,
      hoverEffects: userTheme.hoverEffects,
      fontSize: userTheme.fontSize,
    };
  } catch (error) {
    console.error('[createDefaultTheme] Erro ao criar tema:', error);

    // Se falhar, retorna defaults sem salvar no banco
    const defaultPreset = getDefaultPreset();
    return {
      presetId: 'academic-blue',
      preset: defaultPreset,
      cardStyle: 'FLAT',
      cardShadow: 'NONE',
      cardBorder: true,
      card3D: false,
      cardGlass: false,
      spacing: 'COMFORTABLE',
      borderRadius: '0.5rem',
      animationsEnabled: true,
      animationSpeed: 'NORMAL',
      hoverEffects: true,
      fontSize: 'NORMAL',
    };
  }
}

/**
 * ============================================
 * GET ADMIN THEME - PARA USUÁRIOS PÚBLICOS
 * ============================================
 *
 * Busca o tema do primeiro admin no sistema.
 * Usado para aplicar tema admin em páginas públicas.
 */
export async function getAdminTheme(): Promise<UserThemeData> {
  try {
    // Busca primeiro admin no sistema
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admin) {
      // Retorna tema do admin
      return await getUserTheme(admin.id);
    }

    // Fallback: tema padrão se não houver admin
    const defaultPreset = getDefaultPreset();
    return {
      presetId: 'academic-blue',
      preset: defaultPreset,
      cardStyle: 'FLAT',
      cardShadow: 'NONE',
      cardBorder: true,
      card3D: false,
      cardGlass: false,
      spacing: 'COMFORTABLE',
      borderRadius: '0.5rem',
      animationsEnabled: true,
      animationSpeed: 'NORMAL',
      hoverEffects: true,
      fontSize: 'NORMAL',
    };
  } catch (error) {
    console.error('[getAdminTheme] Erro ao buscar tema admin:', error);

    // Fallback: tema padrão
    const defaultPreset = getDefaultPreset();
    return {
      presetId: 'academic-blue',
      preset: defaultPreset,
      cardStyle: 'FLAT',
      cardShadow: 'NONE',
      cardBorder: true,
      card3D: false,
      cardGlass: false,
      spacing: 'COMFORTABLE',
      borderRadius: '0.5rem',
      animationsEnabled: true,
      animationSpeed: 'NORMAL',
      hoverEffects: true,
      fontSize: 'NORMAL',
    };
  }
}
