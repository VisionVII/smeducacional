/**
 * ============================================
 * THEME PRESETS LIBRARY - SISTEMA EXTENSÍVEL
 * ============================================
 *
 * Estrutura preparada para fácil adição de novos temas.
 * Para adicionar um novo tema:
 *
 * 1. Adicione o ID em ThemePresetId
 * 2. Crie objeto ThemePreset com light + dark
 * 3. Adicione ao array THEME_PRESETS
 * 4. (Opcional) Adicione categoria em ThemeCategory
 */

export type ThemePresetId =
  | 'academic-blue'
  | 'forest-green'
  | 'sunset-orange'
  | 'royal-purple'
  | 'ocean-teal'
  | 'crimson-red';
// | 'mint-fresh'     // Futuro: Saúde, bem-estar
// | 'cherry-blossom' // Futuro: Idiomas orientais

export type ThemeCategory =
  | 'professional' // Cores sóbrias para ambiente corporativo
  | 'creative' // Cores vibrantes para artes
  | 'educational' // Cores que facilitam leitura
  | 'energetic'; // Cores de alta energia
// === FUTURAS CATEGORIAS ===
// | 'gaming'       // Futuro: Gamificação
// | 'tech'         // Futuro: Tech/programação
// | 'wellness'     // Futuro: Saúde

export interface ThemeColors {
  background: string; // HSL format: "0 0% 100%"
  foreground: string;
  primary: string; // Cor principal do tema
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  // Nova cor complementar para composições avançadas
  highlight?: string;
  highlightForeground?: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string; // Cor de foco (accessibility)
  // === CORES EXTENSÍVEIS (já implementadas) ===
  success: string;
  warning: string;
  info: string;
  error: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  category: ThemeCategory;
  light: ThemeColors;
  dark: ThemeColors;
  preview: {
    primaryHex: string; // Para preview visual (ex: "#2563EB")
    secondaryHex: string;
    gradient?: string; // CSS gradient para header de preview
  };
  // === METADADOS EXTENSÍVEIS ===
  tags?: string[]; // Para busca/filtro futuro
  icon?: string; // Lucide icon name (futuro)
  recommended?: {
    // Sugestões contextuais
    subjects?: string[]; // ["matemática", "ciências"]
    roles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[]; // Qual role se beneficia mais
  };
}

// ============================================
// THEME PRESETS - 6 TEMAS BASE
// ============================================

export const THEME_PRESETS: ThemePreset[] = [
  // ========================================
  // 1. ACADEMIC BLUE - Padrão Profissional
  // ========================================
  {
    id: 'academic-blue',
    name: 'Aurora Academia',
    description:
      'Paleta aurora com azul confiável e toques de energia. Ideal para dashboards e cursos corporativos.',
    category: 'professional',
    preview: {
      primaryHex: '#2563EB',
      secondaryHex: '#22D3EE',
      gradient:
        'linear-gradient(135deg, #2563EB 0%, #22D3EE 60%, #F59E0B 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '224 71% 4%',
      primary: '221 83% 53%', // #2563EB
      primaryForeground: '210 40% 98%',
      secondary: '189 94% 43%',
      secondaryForeground: '0 0% 100%',
      accent: '217 91% 60%',
      accentForeground: '222 47% 11%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      card: '0 0% 100%',
      cardForeground: '224 71% 4%',
      muted: '220 14% 96%',
      mutedForeground: '220 9% 46%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '221 83% 53%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '224 71% 4%',
      foreground: '210 40% 98%',
      primary: '217 91% 60%',
      primaryForeground: '222 47% 11%',
      secondary: '189 94% 43%',
      secondaryForeground: '0 0% 100%',
      accent: '221 83% 53%',
      accentForeground: '210 40% 98%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      card: '224 71% 4%',
      cardForeground: '210 40% 98%',
      muted: '215 28% 17%',
      mutedForeground: '217 33% 64%',
      border: '215 28% 17%',
      input: '215 28% 17%',
      ring: '217 91% 60%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['default', 'corporate', 'reliable'],
    recommended: {
      subjects: ['administração', 'gestão', 'negócios'],
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
  },

  // ========================================
  // 2. FOREST GREEN - STEM & Ciências
  // ========================================
  {
    id: 'forest-green',
    name: 'Verde Boreal',
    description:
      'Verde boreal com ar de crescimento e ciência. Perfeito para STEM, biologia e sustentabilidade.',
    category: 'educational',
    preview: {
      primaryHex: '#059669',
      secondaryHex: '#10B981',
      gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 4%',
      primary: '160 84% 39%', // #059669
      primaryForeground: '0 0% 100%',
      secondary: '142 76% 36%',
      secondaryForeground: '0 0% 100%',
      accent: '173 80% 40%',
      highlight: '221 83% 53%',
      highlightForeground: '210 40% 98%',
      accentForeground: '0 0% 100%',
      card: '0 0% 100%',
      cardForeground: '240 10% 4%',
      muted: '143 25% 96%',
      mutedForeground: '143 8% 45%',
      border: '143 20% 90%',
      input: '143 20% 90%',
      ring: '160 84% 39%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '240 10% 4%',
      foreground: '0 0% 98%',
      primary: '160 84% 39%',
      primaryForeground: '0 0% 100%',
      secondary: '142 76% 36%',
      secondaryForeground: '0 0% 100%',
      accent: '173 80% 40%',
      highlight: '221 83% 53%',
      highlightForeground: '210 40% 98%',
      accentForeground: '0 0% 100%',
      card: '240 10% 4%',
      cardForeground: '0 0% 98%',
      muted: '143 16% 20%',
      mutedForeground: '143 10% 65%',
      border: '143 16% 20%',
      input: '143 16% 20%',
      ring: '160 84% 39%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['stem', 'science', 'nature'],
    recommended: {
      subjects: ['biologia', 'química', 'física', 'sustentabilidade'],
    },
  },

  // ========================================
  // 3. SUNSET ORANGE - Criatividade
  // ========================================
  {
    id: 'sunset-orange',
    name: 'Pôr-do-sol Ígneo',
    description:
      'Laranja vibrante que estimula criatividade. Ideal para artes, design e inovação.',
    category: 'creative',
    preview: {
      primaryHex: '#EA580C',
      secondaryHex: '#F97316',
      gradient: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '20 14% 4%',
      primary: '20 91% 48%', // #EA580C
      primaryForeground: '0 0% 100%',
      secondary: '25 95% 53%',
      secondaryForeground: '0 0% 100%',
      accent: '340 82% 58%',
      highlight: '221 83% 53%',
      highlightForeground: '0 0% 100%',
      accentForeground: '0 0% 100%',
      card: '0 0% 100%',
      cardForeground: '20 14% 4%',
      muted: '24 33% 97%',
      mutedForeground: '24 6% 44%',
      border: '24 20% 92%',
      input: '24 20% 92%',
      ring: '20 91% 48%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '20 14% 4%',
      foreground: '0 0% 98%',
      primary: '20 91% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '25 95% 53%',
      secondaryForeground: '0 0% 100%',
      accent: '340 82% 58%',
      highlight: '221 83% 53%',
      highlightForeground: '0 0% 100%',
      accentForeground: '0 0% 100%',
      card: '20 14% 4%',
      cardForeground: '0 0% 98%',
      muted: '24 10% 18%',
      mutedForeground: '24 6% 63%',
      border: '24 10% 18%',
      input: '24 10% 18%',
      ring: '20 91% 48%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['creative', 'arts', 'vibrant'],
    recommended: {
      subjects: ['artes', 'design', 'marketing', 'comunicação'],
    },
  },

  // ========================================
  // 4. ROYAL PURPLE - Premium
  // ========================================
  {
    id: 'royal-purple',
    name: 'Imperial Violeta',
    description:
      'Roxo elegante e premium. Perfeito para cursos executivos e conteúdo exclusivo.',
    category: 'professional',
    preview: {
      primaryHex: '#7C3AED',
      secondaryHex: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '224 71% 4%',
      primary: '262 83% 58%', // #7C3AED
      primaryForeground: '0 0% 100%',
      secondary: '263 70% 50%',
      secondaryForeground: '0 0% 100%',
      accent: '221 83% 53%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      accentForeground: '0 0% 100%',
      card: '0 0% 100%',
      cardForeground: '224 71% 4%',
      muted: '264 24% 96%',
      mutedForeground: '264 5% 44%',
      border: '264 16% 92%',
      input: '264 16% 92%',
      ring: '262 83% 58%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '224 71% 4%',
      foreground: '0 0% 98%',
      primary: '262 83% 58%',
      primaryForeground: '0 0% 100%',
      secondary: '263 70% 50%',
      secondaryForeground: '0 0% 100%',
      accent: '221 83% 53%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      accentForeground: '0 0% 100%',
      card: '224 71% 4%',
      cardForeground: '0 0% 98%',
      muted: '264 12% 18%',
      mutedForeground: '264 8% 65%',
      border: '264 12% 18%',
      input: '264 12% 18%',
      ring: '262 83% 58%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['premium', 'executive', 'elegant'],
    recommended: {
      subjects: ['MBA', 'liderança', 'executive'],
    },
  },

  // ========================================
  // 5. OCEAN TEAL - Leitura & Foco
  // ========================================
  {
    id: 'ocean-teal',
    name: 'Calmaria Oceânica',
    description:
      'Azul-turquesa calmante. Ideal para bibliotecas, leitura e concentração.',
    category: 'educational',
    preview: {
      primaryHex: '#0891B2',
      secondaryHex: '#06B6D4',
      gradient: 'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 4%',
      primary: '188 96% 37%', // #0891B2
      primaryForeground: '0 0% 100%',
      secondary: '189 94% 43%',
      secondaryForeground: '0 0% 100%',
      accent: '221 83% 53%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      accentForeground: '0 0% 100%',
      card: '0 0% 100%',
      cardForeground: '240 10% 4%',
      muted: '189 23% 95%',
      mutedForeground: '189 6% 43%',
      border: '189 15% 90%',
      input: '189 15% 90%',
      ring: '188 96% 37%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '240 10% 4%',
      foreground: '0 0% 98%',
      primary: '188 96% 37%',
      primaryForeground: '0 0% 100%',
      secondary: '189 94% 43%',
      secondaryForeground: '0 0% 100%',
      accent: '221 83% 53%',
      highlight: '38 92% 58%',
      highlightForeground: '222 84% 5%',
      accentForeground: '0 0% 100%',
      card: '240 10% 4%',
      cardForeground: '0 0% 98%',
      muted: '189 12% 17%',
      mutedForeground: '189 8% 62%',
      border: '189 12% 17%',
      input: '189 12% 17%',
      ring: '188 96% 37%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['calm', 'focus', 'reading'],
    recommended: {
      subjects: ['literatura', 'história', 'filosofia'],
    },
  },

  // ========================================
  // 6. CRIMSON RED - Urgência & Energia
  // ========================================
  {
    id: 'crimson-red',
    name: 'Crimson Turbo',
    description:
      'Vermelho energizante. Para bootcamps intensivos e cursos com deadlines.',
    category: 'energetic',
    preview: {
      primaryHex: '#DC2626',
      secondaryHex: '#EF4444',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
    },
    light: {
      background: '0 0% 100%',
      foreground: '0 0% 4%',
      primary: '0 73% 51%', // #DC2626
      primaryForeground: '0 0% 100%',
      secondary: '0 84% 60%',
      secondaryForeground: '0 0% 100%',
      accent: '25 95% 53%',
      highlight: '221 83% 53%',
      highlightForeground: '0 0% 100%',
      accentForeground: '0 0% 100%',
      card: '0 0% 100%',
      cardForeground: '0 0% 4%',
      muted: '0 20% 96%',
      mutedForeground: '0 4% 44%',
      border: '0 13% 91%',
      input: '0 13% 91%',
      ring: '0 73% 51%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    dark: {
      background: '0 0% 4%',
      foreground: '0 0% 98%',
      primary: '0 73% 51%',
      primaryForeground: '0 0% 100%',
      secondary: '0 84% 60%',
      secondaryForeground: '0 0% 100%',
      accent: '25 95% 53%',
      highlight: '221 83% 53%',
      highlightForeground: '0 0% 100%',
      accentForeground: '0 0% 100%',
      card: '0 0% 4%',
      cardForeground: '0 0% 98%',
      muted: '0 8% 17%',
      mutedForeground: '0 5% 63%',
      border: '0 8% 17%',
      input: '0 8% 17%',
      ring: '0 73% 51%',
      success: '142 76% 36%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      error: '0 84% 60%',
    },
    tags: ['energetic', 'urgent', 'bootcamp'],
    recommended: {
      subjects: ['programação', 'bootcamps', 'intensivos'],
    },
  },
];

// ============================================
// HELPER FUNCTIONS - UTILIDADES
// ============================================

/**
 * Busca um preset por ID
 */
export function getPresetById(id: ThemePresetId): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.id === id);
}

/**
 * Busca presets por categoria
 */
export function getPresetsByCategory(category: ThemeCategory): ThemePreset[] {
  return THEME_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Busca presets por tag
 */
export function getPresetsByTag(tag: string): ThemePreset[] {
  return THEME_PRESETS.filter((preset) => preset.tags?.includes(tag));
}

/**
 * Retorna preset padrão (Academic Blue)
 */
export function getDefaultPreset(): ThemePreset {
  return THEME_PRESETS[0]; // academic-blue
}

/**
 * Converte HSL string para CSS variable format
 * Exemplo: "221 83% 53%" → "hsl(221 83% 53%)"
 */
export function hslToCss(hsl: string): string {
  return `hsl(${hsl})`;
}

/**
 * Gera CSS variables a partir de um ThemeColors
 * Usado para injeção inline no <head>
 */
export function generateCssVariables(colors: ThemeColors): string {
  return Object.entries(colors)
    .map(([key, value]) => {
      // Converte camelCase para kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `--${cssKey}: ${value};`;
    })
    .join('\n    ');
}

/**
 * Gera <style> tag completo para SSR
 */
export function generateThemeStyleTag(
  presetId: ThemePresetId,
  mode: 'light' | 'dark'
): string {
  const preset = getPresetById(presetId);
  if (!preset) return '';

  const colors = mode === 'dark' ? preset.dark : preset.light;
  const cssVars = generateCssVariables(colors);

  return `
<style id="theme-vars">
  :root {
    ${cssVars}
  }
</style>`;
}

// ============================================
// TYPE EXPORTS
// ============================================
