'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import { useSession } from 'next-auth/react';

interface NavbarThemeContextType {
  isLoading: boolean;
}

const NavbarThemeContext = createContext<NavbarThemeContextType | undefined>(
  undefined
);

/**
 * Provider que aplica o tema do usuário logado APENAS no navbar,
 * enquanto o resto da página pública usa o tema definido pelo admin.
 *
 * Estratégia:
 * - Aplica variáveis CSS com prefixo --navbar-* para uso exclusivo no navbar
 * - Não interfere nas variáveis globais da página
 */
export function NavbarThemeProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const hasHydratedCache = useRef(false);

  // Aplica cache imediato para evitar flash no navbar ao trocar rota/página
  useEffect(() => {
    if (hasHydratedCache.current) return;
    const cached = localStorage.getItem('navbar-theme-cache');
    if (!cached) return;
    try {
      const { palette } = JSON.parse(cached);
      if (palette) {
        applyNavbarTheme(palette);
        hasHydratedCache.current = true;
      }
    } catch (err) {
      localStorage.removeItem('navbar-theme-cache');
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      // Limpa tema do navbar se não está logado
      clearNavbarTheme();
      localStorage.removeItem('navbar-theme-cache');
      return;
    }

    loadAndApplyUserTheme();

    // Recarregar tema a cada 3 segundos para detectar mudanças
    const interval = setInterval(() => {
      loadAndApplyUserTheme();
    }, 3000);

    return () => clearInterval(interval);
  }, [session, status]);

  const loadAndApplyUserTheme = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/theme', { cache: 'no-store' });

      if (!response.ok) {
        clearNavbarTheme();
        return;
      }

      const data = await response.json();
      const userTheme = data.theme;

      if (!userTheme || !userTheme.palette) {
        clearNavbarTheme();
        return;
      }

      localStorage.setItem(
        'navbar-theme-cache',
        JSON.stringify({ palette: userTheme.palette })
      );

      applyNavbarTheme(userTheme.palette);
    } catch (error) {
      console.error('[NavbarTheme] Erro ao carregar tema do usuário:', error);
      // Em caso de falha, tenta aplicar cache se existir
      const cached = localStorage.getItem('navbar-theme-cache');
      if (cached) {
        try {
          const { palette } = JSON.parse(cached);
          if (palette) {
            applyNavbarTheme(palette);
            return;
          }
        } catch (err) {
          localStorage.removeItem('navbar-theme-cache');
        }
      }
      clearNavbarTheme();
    } finally {
      setIsLoading(false);
    }
  };

  const applyNavbarTheme = (palette: any) => {
    const root = document.documentElement;

    // Desabilita transições para aplicação instantânea
    const prevTransition = root.style.transition;
    root.style.transition = 'none';

    // Aplica variáveis CSS com prefixo --navbar-* para uso exclusivo no navbar
    Object.entries(palette).forEach(([key, value]) => {
      const cssVar = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      root.style.setProperty(`--navbar-${cssVar}`, value as string);
    });

    // Variável extra para border (usa muted como fallback)
    if (!root.style.getPropertyValue('--navbar-border')) {
      root.style.setProperty(
        '--navbar-border',
        palette.muted || palette.background
      );
    }

    // Marca que navbar tem tema customizado
    root.setAttribute('data-navbar-themed', 'true');

    // Restaura transições
    requestAnimationFrame(() => {
      root.style.transition = prevTransition;
    });
  };

  const clearNavbarTheme = () => {
    const root = document.documentElement;
    root.removeAttribute('data-navbar-themed');

    // Remove todas as variáveis do navbar
    const computedStyles = getComputedStyle(root);
    Array.from(computedStyles).forEach((prop) => {
      if (prop.startsWith('--navbar-')) {
        root.style.removeProperty(prop);
      }
    });
  };

  return (
    <NavbarThemeContext.Provider value={{ isLoading }}>
      {children}
    </NavbarThemeContext.Provider>
  );
}

export function useNavbarTheme() {
  const context = useContext(NavbarThemeContext);
  if (!context) {
    throw new Error('useNavbarTheme must be used within NavbarThemeProvider');
  }
  return context;
}
