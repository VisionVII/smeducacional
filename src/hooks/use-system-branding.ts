'use client';

import { useEffect, useState } from 'react';

interface SystemBranding {
  companyName: string;
  systemName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBgUrl: string | null;
  navbarBgUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  // Títulos e descrições de páginas públicas
  homeTitle: string;
  homeDescription: string;
  loginTitle: string;
  loginDescription: string;
  registerTitle: string;
  registerDescription: string;
  coursesTitle: string;
  coursesDescription: string;
}

// Cache global para evitar re-fetches desnecessários
let cachedBranding: SystemBranding | null = null;
let fetchPromise: Promise<SystemBranding> | null = null;

// Função para limpar cache de branding (chamada após atualização no admin)
export function clearBrandingCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('system-branding-cache');
    cachedBranding = null;
    fetchPromise = null;
    // Dispara evento customizado para que outros componentes recarreguem
    window.dispatchEvent(new Event('branding-cache-cleared'));
    console.log('[useSystemBranding] Cache limpo e evento disparado');
  }
}

export function useSystemBranding() {
  // SEMPRE inicia com fallback para evitar hydration mismatch
  const [branding, setBranding] = useState<SystemBranding>({
    companyName: 'SM Educacional',
    systemName: 'SM Educacional',
    logoUrl: null,
    faviconUrl: null,
    loginBgUrl: null,
    navbarBgUrl: null,
    primaryColor: null,
    secondaryColor: null,
    homeTitle: 'Bem-vindo ao SM Educacional',
    homeDescription: 'Transforme seu futuro com educação de qualidade',
    loginTitle: 'Bem-vindo de volta',
    loginDescription: 'Entre com suas credenciais para acessar sua conta',
    registerTitle: 'Crie sua conta',
    registerDescription: 'Comece sua jornada de aprendizado hoje',
    coursesTitle: 'Nossos Cursos',
    coursesDescription: 'Descubra cursos incríveis para alavancar sua carreira',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranding() {
      try {
        // Tenta carregar do localStorage primeiro (apenas no cliente)
        const cached = localStorage.getItem('system-branding-cache');
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            setBranding(parsedCache);
            setLoading(false);
            return;
          } catch (err) {
            console.debug('[use-system-branding] Parse cache error:', err);
          }
        }

        // Se já existe cache em memória, usa ele
        if (cachedBranding) {
          setBranding(cachedBranding);
          setLoading(false);
          return;
        }

        // Se já existe um fetch em andamento, espera ele
        if (fetchPromise) {
          const data = await fetchPromise;
          setBranding(data);
          setLoading(false);
          return;
        }

        // Inicia novo fetch
        fetchPromise = fetch('/api/system/branding').then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            // Salva no cache
            cachedBranding = data;
            localStorage.setItem('system-branding-cache', JSON.stringify(data));
            return data;
          }
          throw new Error('Failed to fetch branding');
        });

        const data = await fetchPromise;
        setBranding(data);
      } catch (error) {
        console.error('[useSystemBranding] Erro ao carregar branding:', error);
      } finally {
        setLoading(false);
        fetchPromise = null;
      }
    }

    loadBranding();

    // Listener para quando cache for limpo (ex: admin salvou configurações)
    const handleCacheCleared = () => {
      console.log(
        '[useSystemBranding] Evento de cache limpo detectado, recarregando...'
      );
      loadBranding();
    };

    // Listener para mudanças no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'system-branding-cache' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setBranding(newData);
          console.log('[useSystemBranding] Cache atualizado de outra aba');
        } catch (err) {
          console.error('[useSystemBranding] Erro ao parsear cache:', err);
        }
      } else if (e.key === 'system-branding-cache' && !e.newValue) {
        // Cache foi limpo em outra aba
        loadBranding();
      }
    };

    window.addEventListener('branding-cache-cleared', handleCacheCleared);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('branding-cache-cleared', handleCacheCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { branding, loading };
}
