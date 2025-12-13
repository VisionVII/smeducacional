/**
 * Sistema de Anúncios e Monetização - VisionVII
 *
 * Estrutura de suporte para anúncios estratégicos na plataforma.
 * Controla exibição, frequência e receita de publicidade.
 */

export enum AdPlacement {
  VIDEO_PRE_ROLL = 'video_pre_roll', // Antes do vídeo (5-10s)
  VIDEO_MID_ROLL = 'video_mid_roll', // Durante o vídeo (15-30s)
  SIDEBAR_BANNER = 'sidebar_banner', // Banner lateral
  COURSE_HEADER = 'course_header', // Topo da página de curso
  DASHBOARD_WIDGET = 'dashboard_widget', // Widget no dashboard
  INTERSITIAL = 'intersitial', // Entre seções
}

export enum UserPlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PREMIUM_TEACHER = 'PREMIUM_TEACHER',
  ADMIN = 'ADMIN',
}

/**
 * Interface para controlar exibição de anúncios
 * Baseado no plano do usuário e suas preferências
 */
export interface AdConfig {
  placement: AdPlacement;
  shouldDisplay: boolean;
  userPlan: UserPlanType;
  maxFrequency: number; // Máximo de anúncios por sessão
  minIntervalSeconds: number; // Intervalo mínimo entre anúncios
}

/**
 * Determina se um usuário deve ver anúncios
 * FREE = com anúncios
 * PREMIUM = sem anúncios
 * TEACHER = sem anúncios (se plano premium)
 * ADMIN = sem anúncios
 */
export function shouldDisplayAds(userPlan: UserPlanType): boolean {
  return userPlan === UserPlanType.FREE;
}

/**
 * Gera configuração de anúncios para um usuário específico
 */
export function getAdConfig(
  userPlan: UserPlanType,
  placement: AdPlacement
): AdConfig {
  const baseConfig = {
    placement,
    userPlan,
    maxFrequency: 3, // Máx 3 anúncios por sessão
    minIntervalSeconds: 60, // 1 minuto entre anúncios
  };

  return {
    ...baseConfig,
    shouldDisplay: shouldDisplayAds(userPlan),
  };
}

/**
 * Calcula receita estimada por anúncio
 * Valores base (ajustar conforme necessário):
 * - CPM (Cost Per Mille): $2-5 por 1000 impressões
 * - CPC (Cost Per Click): $0.50-2 por clique
 */
export function estimateAdRevenue(
  impressions: number,
  clicks: number,
  cpmRate: number = 3.5,
  cpcRate: number = 1.0
): { totalRevenue: number; fromImpressions: number; fromClicks: number } {
  const fromImpressions = (impressions / 1000) * cpmRate;
  const fromClicks = clicks * cpcRate;
  const totalRevenue = fromImpressions + fromClicks;

  return {
    totalRevenue,
    fromImpressions,
    fromClicks,
  };
}

/**
 * Estrutura de receita por hierarquia
 * Admin > Professor > Plataforma
 */
export interface RevenueDistribution {
  totalRevenue: number;
  adminShare: number; // 30% para admin
  teacherShare: number; // 40% para professor (por aluno)
  platformShare: number; // 30% para manutenção
}

/**
 * Calcula distribuição de receita
 * Modelo: 30% admin, 40% professor (por student), 30% plataforma
 */
export function calculateRevenueDistribution(
  totalRevenue: number,
  studentCount: number = 1
): RevenueDistribution {
  const adminShare = totalRevenue * 0.3;
  const teacherShare = totalRevenue * 0.4;
  const platformShare = totalRevenue * 0.3;

  return {
    totalRevenue,
    adminShare,
    teacherShare: teacherShare / Math.max(studentCount, 1),
    platformShare,
  };
}

/**
 * Tipos de anúncios suportados
 */
export enum AdType {
  DISPLAY = 'display', // Banner/imagem
  VIDEO = 'video', // Anúncio em vídeo
  NATIVE = 'native', // Anúncio nativo (integrado ao conteúdo)
  TEXT = 'text', // Anúncio de texto
}

/**
 * Interface para rastreamento de anúncios
 */
export interface AdMetrics {
  id: string;
  placement: AdPlacement;
  type: AdType;
  impressions: number;
  clicks: number;
  conversions: number;
  estimatedRevenue: number;
  timestamp: Date;
  userPlan: UserPlanType;
}
