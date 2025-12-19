'use client';

import { useEffect, useState } from 'react';

interface SystemBranding {
  companyName: string;
  systemName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  navbarBgUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

// Cache global para evitar re-fetches desnecessários
let cachedBranding: SystemBranding | null = null;
let fetchPromise: Promise<SystemBranding> | null = null;

export function useSystemBranding() {
  // SEMPRE inicia com fallback para evitar hydration mismatch
  const [branding, setBranding] = useState<SystemBranding>({
    companyName: 'SM Educacional',
    systemName: 'SM Educacional',
    logoUrl: null,
    faviconUrl: null,
    navbarBgUrl: null,
    primaryColor: null,
    secondaryColor: null,
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
          } catch (e) {
            // Ignora erro e continua para fetch
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
  }, []);

  return { branding, loading };
}
