'use client';

import { useEffect, useState } from 'react';

interface SystemBranding {
  companyName: string;
  systemName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export function useSystemBranding() {
  const [branding, setBranding] = useState<SystemBranding>({
    companyName: 'SM Educacional',
    systemName: 'SM Educacional',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: null,
    secondaryColor: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch('/api/system/branding');
        if (res.ok) {
          const data = await res.json();
          setBranding(data);
        }
      } catch (error) {
        console.error('[useSystemBranding] Erro ao carregar branding:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBranding();
  }, []);

  return { branding, loading };
}
