'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useTheme as useNextTheme } from 'next-themes';
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

interface ThemeAnimations {
  enabled: boolean;
  duration: 'slow' | 'normal' | 'fast';
  easing:
    | 'ease-in-out'
    | 'ease-in'
    | 'ease-out'
    | 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  transitions: ('all' | 'colors' | 'transforms' | 'opacity')[];
  hover: boolean;
  focus: boolean;
  pageTransitions: boolean;
}

interface TeacherTheme {
  palette: ThemePalette;
  layout: ThemeLayout;
  animations?: ThemeAnimations;
  themeName?: string | null;
}

interface ThemeContextType {
  theme: TeacherTheme | null;
  loadTheme: () => Promise<void>;
  updateTheme: (theme: Partial<TeacherTheme>) => Promise<void>;
  resetTheme: () => Promise<void>;
  isLoading: boolean;
  systemTheme: string | undefined;
  setSystemTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME =
  THEME_PRESETS.find((preset) => preset.id === 'default') ?? THEME_PRESETS[0];

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

const ensureReadableForegroundDark = (value: string, fallback: string) => {
  const base = parseHsl(value ?? fallback);
  return toHsl({
    h: base.h,
    s: clamp(base.s, 6, 40),
    l: clamp(base.l < 80 ? 92 : base.l, 90, 96),
  });
};

const ensureMutedForegroundLight = (value: string, fallback: string) => {
  const base = parseHsl(value ?? fallback);
  return toHsl({
    h: base.h,
    s: clamp(base.s, 4, 24),
    l: clamp(base.l, 38, 52),
  });
};

const ensureMutedForegroundDark = (value: string, fallback: string) => {
  const base = parseHsl(value ?? fallback);
  return toHsl({
    h: base.h,
    s: clamp(base.s, 5, 28),
    l: clamp(base.l, 62, 78),
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
  const cardForeground = ensureReadableForegroundLight(
    palette.cardForeground,
    foreground
  );
  const mutedForeground = ensureMutedForegroundLight(
    palette.mutedForeground,
    '215 20% 45%'
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
    cardForeground,
    mutedForeground,
  };
};

const normalizeForDark = (palette: ThemePalette): ThemePalette => {
  const baseBg = setLightness(palette.background, 6);
  const card = setLightness(palette.card ?? palette.background, 9);
  const muted = setLightness(palette.muted ?? palette.background, 16);

  const ensurePunch = (value: string, minLightness: number) => {
    const hsl = parseHsl(value);
    const nextL = Math.max(hsl.l, minLightness);
    return toHsl({ ...hsl, l: clamp(nextL, minLightness, 78) });
  };

  const primary = ensurePunch(palette.primary, 42);
  const secondary = ensurePunch(palette.secondary, 30);
  const accent = ensurePunch(palette.accent, 28);

  return {
    ...palette,
    background: baseBg,
    card,
    muted,
    primary,
    secondary,
    accent,
    foreground: ensureReadableForegroundDark(palette.foreground, '210 40% 98%'),
    cardForeground: ensureReadableForegroundDark(
      palette.cardForeground,
      '210 40% 98%'
    ),
    mutedForeground: ensureMutedForegroundDark(
      palette.mutedForeground,
      '215 20% 75%'
    ),
    primaryForeground: '0 0% 100%',
    secondaryForeground: '0 0% 98%',
    accentForeground: palette.accentForeground ?? '0 0% 98%',
  };
};

export function TeacherThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<TeacherTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const {
    theme: themeMode,
    resolvedTheme,
    setTheme: setSystemTheme,
  } = useNextTheme();

  const loadTheme = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('/api/teacher/theme', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Theme loaded successfully

        setTheme(data);
        applyTheme(data, resolvedTheme ?? themeMode);
      } else {
        console.warn('[loadTheme] Failed to load theme, using fallback');

        // Fallback para tema padrão quando não autenticado ou erro
        if (DEFAULT_THEME) {
          const fallback = {
            palette: DEFAULT_THEME.palette,
            layout: DEFAULT_THEME.layout,
            animations: DEFAULT_THEME.animations,
            themeName: DEFAULT_THEME.name,
          };
          setTheme(fallback as TeacherTheme);
          applyTheme(fallback as TeacherTheme, resolvedTheme ?? themeMode);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Timeout ao carregar tema (3s)');
      } else {
        console.error('Erro ao carregar tema:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<TeacherTheme>) => {
    try {
      // Updating theme

      const response = await fetch('/api/teacher/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      // Response received

      if (response.ok) {
        const data = await response.json();
        setTheme(data);
        applyTheme(data, resolvedTheme ?? themeMode);
      } else {
        const error = await response.json();
        console.error('[updateTheme] API Error:', error);
        console.error(
          '[updateTheme] Error details:',
          JSON.stringify(error, null, 2)
        );
        throw new Error(`API Error: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('[updateTheme] Catch block error:', error);
      throw error;
    }
  };

  const resetTheme = async () => {
    try {
      const response = await fetch('/api/teacher/theme', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recarregar tema padrão
        await loadTheme();
      }
    } catch (error) {
      console.error('Erro ao resetar tema:', error);
      throw error;
    }
  };

  const applyTheme = (themeData: TeacherTheme, mode?: string) => {
    const root = document.documentElement;
    const activeMode = mode ?? 'light';
    const resolvedPalette =
      activeMode === 'dark'
        ? normalizeForDark(themeData.palette)
        : normalizeForLight(themeData.palette);

    console.debug('[applyTheme] Setting CSS variables:', {
      mode: activeMode,
      primary: resolvedPalette.primary,
      background: resolvedPalette.background,
    });

    Object.entries(resolvedPalette).forEach(([key, value]) => {
      const cssVar = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      root.style.setProperty(`--${cssVar}`, value);
    });

    // Derivados para efeitos e overlays
    const primaryHsl = parseHsl(resolvedPalette.primary);
    const secondaryHsl = parseHsl(resolvedPalette.secondary);
    const accentHsl = parseHsl(resolvedPalette.accent);

    root.style.setProperty('--gradient-from', `hsl(${toHsl(primaryHsl)})`);
    root.style.setProperty('--gradient-to', `hsl(${toHsl(secondaryHsl)})`);
    root.style.setProperty('--accent-sheen', toHsla(accentHsl, 0.12));
    root.style.setProperty('--primary-glow', toHsla(primaryHsl, 0.18));
    root.style.setProperty('--surface-strong', `hsl(${resolvedPalette.card})`);
    root.style.setProperty('--surface-muted', `hsl(${resolvedPalette.muted})`);
    root.style.setProperty(
      '--text-strong',
      `hsl(${resolvedPalette.foreground})`
    );
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
      medium:
        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      strong:
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    };
    root.style.setProperty(
      '--shadow',
      shadowMap[themeData.layout.shadowIntensity]
    );

    const cardStyleMap = {
      default: 'var(--shadow)',
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

    // Configurações de animação
    const animations = themeData.animations ?? {
      enabled: true,
      duration: 'normal',
      easing: 'ease-in-out',
      transitions: ['all'],
      hover: true,
      focus: true,
      pageTransitions: true,
    };

    const durationMap = {
      slow: '500ms',
      normal: '200ms',
      fast: '100ms',
    };

    root.style.setProperty(
      '--transition-duration',
      durationMap[animations.duration]
    );
    root.style.setProperty('--transition-easing', animations.easing);
    root.style.setProperty(
      '--animations-enabled',
      animations.enabled ? '1' : '0'
    );
    root.style.setProperty('--hover-animations', animations.hover ? '1' : '0');
    root.style.setProperty('--focus-animations', animations.focus ? '1' : '0');
    root.style.setProperty(
      '--page-transitions',
      animations.pageTransitions ? '1' : '0'
    );

    // Aplicar classe de animação global
    if (animations.enabled) {
      root.classList.add('animations-enabled');
    } else {
      root.classList.remove('animations-enabled');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadTheme();
    }
  }, [mounted]);

  // Ao desmontar (navegar para rotas fora de /teacher), restaura CSS vars para o tema padrão
  useEffect(() => {
    return () => {
      if (!DEFAULT_THEME) return;

      const fallback = {
        palette: DEFAULT_THEME.palette,
        layout: DEFAULT_THEME.layout,
        animations: DEFAULT_THEME.animations,
        themeName: DEFAULT_THEME.name,
      };

      applyTheme(
        fallback as TeacherTheme,
        resolvedTheme ?? themeMode ?? 'light'
      );
    };
  }, [resolvedTheme, themeMode]);

  // Reaplicar tema quando o modo (claro/escuro) mudar
  useEffect(() => {
    if (theme && mounted) {
      applyTheme(theme, resolvedTheme ?? themeMode);
    }
  }, [resolvedTheme, themeMode, theme, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loadTheme,
        updateTheme,
        resetTheme,
        isLoading,
        systemTheme: themeMode,
        setSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTeacherTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      'useTeacherTheme must be used within a TeacherThemeProvider'
    );
  }
  return context;
}
