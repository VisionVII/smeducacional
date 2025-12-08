/**
 * Provider para rotas públicas que herdam o tema de um professor específico
 * Usado em: landing-preview, páginas de cursos públicas, etc
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { THEME_PRESETS } from '@/lib/theme-presets';

interface ThemePalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
}

interface ThemeLayout {
  cardStyle: 'default' | 'bordered' | 'elevated' | 'flat';
  borderRadius: string;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
  spacing: 'compact' | 'comfortable' | 'spacious';
}

interface PublicTheme {
  palette: ThemePalette;
  layout: ThemeLayout;
  themeName?: string | null;
}

interface PublicThemeContextType {
  theme: PublicTheme | null;
  isLoading: boolean;
  loadTeacherTheme: (teacherId: string) => Promise<void>;
}

const PublicThemeContext = createContext<PublicThemeContextType | undefined>(
  undefined
);

const DEFAULT_PRESET =
  THEME_PRESETS.find((p) => p.id === 'default') ?? THEME_PRESETS[0];

const DEFAULT_THEME: PublicTheme = {
  palette: DEFAULT_PRESET.palette,
  layout: DEFAULT_PRESET.layout,
  themeName: DEFAULT_PRESET.name,
};

type HslValue = {
  h: number;
  s: number;
  l: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const round = (value: number, digits = 1) => parseFloat(value.toFixed(digits));

const parseHsl = (value: string): HslValue => {
  const [h, s, l] = value.split(' ');
  return {
    h: parseFloat(h),
    s: parseFloat(s.replace('%', '')),
    l: parseFloat(l.replace('%', '')),
  };
};

const toHsl = ({ h, s, l }: HslValue) =>
  `${round(h)} ${round(s)}% ${round(l)}%`;

const toHsla = ({ h, s, l }: HslValue, a: number) =>
  `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${clamp(a, 0, 1)})`;

const setLightness = (value: string, target: number) => {
  const hsl = parseHsl(value);
  return toHsl({ ...hsl, l: clamp(target, 0, 100) });
};

const ensureReadableForegroundLight = (value: string, fallback: string) => {
  const base = parseHsl(value ?? fallback);
  return toHsl({
    h: base.h,
    s: clamp(base.s, 8, 45),
    l: clamp(base.l, 12, 24),
  });
};

const normalizeForLight = (palette: ThemePalette): ThemePalette => {
  const background = setLightness(
    palette.background,
    Math.max(parseHsl(palette.background).l, 96)
  );
  const card = setLightness(
    palette.card ?? palette.background,
    Math.max(parseHsl(palette.card ?? palette.background).l, 98)
  );
  const muted = setLightness(
    palette.muted ?? palette.background,
    Math.max(parseHsl(palette.muted ?? palette.background).l, 94)
  );
  const primary = setLightness(
    palette.primary,
    clamp(parseHsl(palette.primary).l, 38, 62)
  );
  const secondary = setLightness(
    palette.secondary,
    clamp(parseHsl(palette.secondary).l, 35, 70)
  );
  const accent = setLightness(
    palette.accent,
    clamp(parseHsl(palette.accent).l, 34, 68)
  );
  const foreground = ensureReadableForegroundLight(
    palette.foreground,
    '240 10% 10%'
  );

  return {
    ...palette,
    background,
    card,
    muted,
    primary,
    secondary,
    accent,
    foreground,
  };
};

const applyTheme = (themeData: PublicTheme) => {
  const root = document.documentElement;
  const resolvedPalette = normalizeForLight(themeData.palette);

  Object.entries(resolvedPalette).forEach(([key, value]) => {
    const cssVar = key
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    root.style.setProperty(`--${cssVar}`, value);
  });

  // Derivados
  const primaryHsl = parseHsl(resolvedPalette.primary);
  const secondaryHsl = parseHsl(resolvedPalette.secondary);
  const accentHsl = parseHsl(resolvedPalette.accent);

  root.style.setProperty('--gradient-from', `hsl(${toHsl(primaryHsl)})`);
  root.style.setProperty('--gradient-to', `hsl(${toHsl(secondaryHsl)})`);
  root.style.setProperty('--accent-sheen', toHsla(accentHsl, 0.12));
  root.style.setProperty('--primary-glow', toHsla(primaryHsl, 0.18));
  root.style.setProperty('--surface-strong', `hsl(${resolvedPalette.card})`);
  root.style.setProperty('--surface-muted', `hsl(${resolvedPalette.muted})`);
  root.style.setProperty('--text-strong', `hsl(${resolvedPalette.foreground})`);
  root.style.setProperty(
    '--text-soft',
    `hsl(${resolvedPalette.mutedForeground})`
  );

  root.style.setProperty('--radius', themeData.layout.borderRadius);

  const spacingMap = {
    compact: '0.75rem',
    comfortable: '1rem',
    spacious: '1.5rem',
  };
  root.style.setProperty('--spacing', spacingMap[themeData.layout.spacing]);

  const shadowMap = {
    none: 'none',
    light: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    strong:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  };
  root.style.setProperty(
    '--shadow',
    shadowMap[themeData.layout.shadowIntensity]
  );

  const cardStyleMap = {
    default: shadowMap.medium,
    bordered: 'none',
    elevated: shadowMap.strong,
    flat: 'none',
  };
  root.style.setProperty(
    '--card-shadow',
    cardStyleMap[themeData.layout.cardStyle]
  );

  const cardBorderMap = {
    default: '1px solid hsl(var(--border))',
    bordered: '2px solid hsl(var(--border))',
    elevated: 'none',
    flat: 'none',
  };
  root.style.setProperty(
    '--card-border',
    cardBorderMap[themeData.layout.cardStyle]
  );
};

export function PublicThemeProvider({
  children,
  teacherId,
}: {
  children: ReactNode;
  teacherId?: string;
}) {
  const [theme, setTheme] = useState<PublicTheme | null>(null);
  const [isLoading, setIsLoading] = useState(!!teacherId);
  const [mounted, setMounted] = useState(false);

  const loadTeacherTheme = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teacher/${id}/theme`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setTheme(data);
        applyTheme(data);
      } else {
        setTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Erro ao carregar tema do professor:', error);
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && teacherId) {
      loadTeacherTheme(teacherId);
    } else if (mounted && !teacherId) {
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
      setIsLoading(false);
    }
  }, [mounted, teacherId]);

  // Restaurar tema padrão ao desmontar para evitar vazamento entre rotas
  useEffect(() => {
    return () => {
      applyTheme(DEFAULT_THEME);
    };
  }, []);

  return (
    <PublicThemeContext.Provider
      value={{
        theme: theme ?? DEFAULT_THEME,
        isLoading,
        loadTeacherTheme,
      }}
    >
      {children}
    </PublicThemeContext.Provider>
  );
}

export function usePublicTheme() {
  const context = useContext(PublicThemeContext);
  if (context === undefined) {
    throw new Error(
      'usePublicTheme deve ser usado dentro de PublicThemeProvider'
    );
  }
  return context;
}
