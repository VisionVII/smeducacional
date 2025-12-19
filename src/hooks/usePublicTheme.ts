'use client';

import { useEffect, useState } from 'react';

export interface PublicTheme {
  palette: {
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
  };
  layout?: {
    cardStyle?: 'default' | 'elevated' | 'bordered';
    borderRadius?: string;
    shadowIntensity?: 'none' | 'light' | 'medium' | 'strong';
    spacing?: 'compact' | 'comfortable' | 'spacious';
  };
  animations?: {
    enabled?: boolean;
    duration?: string;
    easing?: string;
    transitions?: string[];
    hover?: boolean;
    focus?: boolean;
    pageTransitions?: boolean;
  };
  themeName?: string;
}

const CACHE_KEY = 'sm-educa-public-theme';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedTheme {
  theme: PublicTheme | null;
  timestamp: number;
}

export function usePublicTheme() {
  const [theme, setTheme] = useState<PublicTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        // Tentar carregar do cache primeiro
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed: CachedTheme = JSON.parse(cached);
            const now = Date.now();

            // Se o cache ainda é válido, usar ele
            if (now - parsed.timestamp < CACHE_DURATION) {
              if (parsed.theme) {
                setTheme(parsed.theme);
                applyTheme(parsed.theme);
              }
              setLoading(false);

              // Buscar atualização em background
              fetchAndUpdateTheme();
              return;
            }
          } catch (e) {
            console.error('Erro ao parsear tema do cache:', e);
          }
        }

        // Se não tem cache válido, buscar do servidor
        await fetchAndUpdateTheme();
      } catch (error) {
        console.error('Erro ao carregar tema público:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchAndUpdateTheme() {
      try {
        const res = await fetch('/api/system/public-theme', {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();

          if (data.theme) {
            setTheme(data.theme);
            applyTheme(data.theme);

            // Salvar no cache
            const cached: CachedTheme = {
              theme: data.theme,
              timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar tema do servidor:', error);
      }
    }

    loadTheme();
  }, []);

  return { theme, loading };
}

function applyTheme(theme: PublicTheme) {
  if (!theme.palette) return;

  const root = document.documentElement;

  // Aplicar cores CSS variables
  Object.entries(theme.palette).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Aplicar border radius
  if (theme.layout?.borderRadius) {
    root.style.setProperty('--radius', theme.layout.borderRadius);
  }

  // Aplicar classes de animação se necessário
  if (theme.animations?.enabled === false) {
    root.classList.add('no-animations');
  } else {
    root.classList.remove('no-animations');
  }
}

// Função para invalidar o cache manualmente (útil após salvar configurações)
export function invalidatePublicThemeCache() {
  localStorage.removeItem(CACHE_KEY);
}
