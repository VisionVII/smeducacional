'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
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

interface StudentTheme {
  palette: ThemePalette;
  layout: ThemeLayout;
  animations?: ThemeAnimations;
  themeName?: string | null;
  teacherId?: string;
}

interface StudentThemeContextType {
  theme: StudentTheme | null;
  loadTheme: () => Promise<void>;
  isLoading: boolean;
  refreshTheme: () => Promise<void>; // Força reload sem cache
  // Aluno só pode mudar dark/light, não as cores
  systemTheme: string | undefined;
  setSystemTheme: (theme: string) => void;
}

const StudentThemeContext = createContext<StudentThemeContextType | undefined>(
  undefined
);

const DEFAULT_PRESET =
  THEME_PRESETS.find((preset) => preset.id === 'default') ?? THEME_PRESETS[0];

const DEFAULT_THEME: StudentTheme = {
  palette: DEFAULT_PRESET.palette,
  layout: DEFAULT_PRESET.layout,
  animations: DEFAULT_PRESET.animations as ThemeAnimations | undefined,
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
    s: clamp(base.s, 5, 30),
    l: clamp(base.l, 88, 98),
  });
};

export function StudentThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<StudentTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hydratedCache = useRef(false);

  // Função para forçar refresh sem cache
  const refreshTheme = async () => {
    localStorage.removeItem('user-theme-cache');
    await loadTheme();
  };

  // Função para buscar o tema PRÓPRIO do usuário (sem amarrações)
  const loadTheme = async () => {
    try {
      setIsLoading(true);

      // Verifica se tem cache válido (persistente)
      const cached = localStorage.getItem('user-theme-cache');
      if (cached) {
        try {
          const { theme: cachedTheme } = JSON.parse(cached);
          // Hidrata imediatamente para evitar flash
          if (!hydratedCache.current && cachedTheme) {
            setTheme(cachedTheme || DEFAULT_THEME);
            hydratedCache.current = true;
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Cache inválido, remove
          localStorage.removeItem('user-theme-cache');
        }
      }

      // Busca o tema PRÓPRIO do usuário autenticado (via /api/user/theme)
      const themeRes = await fetch('/api/user/theme');

      if (!themeRes.ok) {
        console.error('[ThemeProvider] Erro ao buscar tema do usuário');
        setTheme(DEFAULT_THEME);
        setIsLoading(false);
        return;
      }

      const { theme: userTheme } = await themeRes.json();

      // Se não tem tema customizado, usa padrão
      const loadedTheme = userTheme || DEFAULT_THEME;

      // Salva no cache persistente
      localStorage.setItem(
        'user-theme-cache',
        JSON.stringify({
          theme: loadedTheme,
        })
      );
      setTheme(loadedTheme);
    } catch (error) {
      setTheme(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar o tema no DOM
  const applyTheme = (currentTheme: StudentTheme, mode: string) => {
    const root = document.documentElement;
    const isDark = mode === 'dark';

    // Cores da paleta
    const { palette, layout, animations } = currentTheme;

    // 🚀 Desabilita transições para aplicação instantânea
    const prevTransition = root.style.transition;
    root.style.transition = 'opacity 60ms ease-out';

    if (isDark) {
      // Dark mode - ajusta lightness para modo escuro
      root.style.setProperty(
        '--background',
        setLightness(palette.background, 4)
      );
      root.style.setProperty(
        '--foreground',
        ensureReadableForegroundDark(palette.foreground, '213 31% 91%')
      );
      root.style.setProperty('--primary', palette.primary);
      root.style.setProperty('--primary-foreground', palette.primaryForeground);
      root.style.setProperty(
        '--secondary',
        setLightness(palette.secondary, 15)
      );
      root.style.setProperty(
        '--secondary-foreground',
        palette.secondaryForeground
      );
      root.style.setProperty('--accent', setLightness(palette.accent, 15));
      root.style.setProperty('--accent-foreground', palette.accentForeground);
      root.style.setProperty('--card', setLightness(palette.card, 6));
      root.style.setProperty('--card-foreground', palette.cardForeground);
      root.style.setProperty('--muted', setLightness(palette.muted, 12));
      root.style.setProperty('--muted-foreground', palette.mutedForeground);
    } else {
      // Light mode - usa valores originais
      root.style.setProperty('--background', palette.background);
      root.style.setProperty(
        '--foreground',
        ensureReadableForegroundLight(palette.foreground, '240 10% 3.9%')
      );
      root.style.setProperty('--primary', palette.primary);
      root.style.setProperty('--primary-foreground', palette.primaryForeground);
      root.style.setProperty('--secondary', palette.secondary);
      root.style.setProperty(
        '--secondary-foreground',
        palette.secondaryForeground
      );
      root.style.setProperty('--accent', palette.accent);
      root.style.setProperty('--accent-foreground', palette.accentForeground);
      root.style.setProperty('--card', palette.card);
      root.style.setProperty('--card-foreground', palette.cardForeground);
      root.style.setProperty('--muted', palette.muted);
      root.style.setProperty('--muted-foreground', palette.mutedForeground);
    }

    // Layout
    root.style.setProperty('--radius', layout.borderRadius);
    root.style.setProperty('--card-style', layout.cardStyle);
    root.style.setProperty('--shadow-intensity', layout.shadowIntensity);
    root.style.setProperty('--spacing', layout.spacing);

    // Animações (se existirem)
    if (animations) {
      const durationMap = { slow: '500ms', normal: '300ms', fast: '150ms' };
      root.style.setProperty(
        '--animation-duration',
        durationMap[animations.duration]
      );
      root.style.setProperty('--animation-easing', animations.easing);
      root.style.setProperty('--animation-hover', animations.hover ? '1' : '0');
      root.style.setProperty('--animation-focus', animations.focus ? '1' : '0');
      root.style.setProperty(
        '--page-transitions',
        animations.pageTransitions ? '1' : '0'
      );

      if (animations.enabled) {
        root.classList.add('animations-enabled');
      } else {
        root.classList.remove('animations-enabled');
      }
    }

    // 🚀 Força repaint e restaura transições leves após aplicação
    requestAnimationFrame(() => {
      root.style.transition = prevTransition || 'opacity 120ms ease-out';
    });
  };

  // Carregar tema no mount (apenas uma vez)
  useEffect(() => {
    // Hidratação imediata do cache local (sem await)
    const cached = localStorage.getItem('user-theme-cache');
    if (cached && !hydratedCache.current) {
      try {
        const { theme: cachedTheme } = JSON.parse(cached);
        if (cachedTheme) {
          setTheme(cachedTheme);
          hydratedCache.current = true;
          setIsLoading(false);
        }
      } catch (err) {
        localStorage.removeItem('user-theme-cache');
      }
    }

    loadTheme();
  }, []);

  // Aplicar tema quando carregado ou quando o modo dark/light muda
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const mode = isDark ? 'dark' : 'light';
    applyTheme(theme, mode);
  }, [theme]);

  // Observer para detectar mudanças de dark/light e reaplicar o tema globalmente
  useEffect(() => {
    if (!theme) return;

    const target = document.documentElement;
    let prevIsDark = target.classList.contains('dark');

    const observer = new MutationObserver(() => {
      const isDark = target.classList.contains('dark');
      // Ignora mudanças de classe que não alteram o estado dark/light
      if (isDark === prevIsDark) return;
      prevIsDark = isDark;
      const mode = isDark ? 'dark' : 'light';
      applyTheme(theme, mode);
    });

    observer.observe(target, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [theme]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="student-theme-mode"
      enableColorScheme
    >
      <StudentThemeContext.Provider
        value={{
          theme,
          loadTheme,
          isLoading,
          refreshTheme,
          systemTheme: undefined,
          setSystemTheme: () => {},
        }}
      >
        {isLoading ? (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Carregando tema personalizado...
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </StudentThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useStudentTheme() {
  const context = useContext(StudentThemeContext);
  if (!context) {
    throw new Error(
      'useStudentTheme must be used within a StudentThemeProvider'
    );
  }
  return context;
}
