'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import ptJson from '../../messages/pt-BR.json';
import enJson from '../../messages/en-US.json';
import esJson from '../../messages/es-ES.json';
import { locales, type Locale } from '@/lib/locales';

export { locales, type Locale };

export type Translation = typeof ptJson;

export const translationsMap: Record<Locale, Translation> = {
  'pt-BR': ptJson as Translation,
  'en-US': enJson as unknown as Translation,
  'es-ES': esJson as unknown as Translation,
};

const STORAGE_KEY = 'preferred-locale';
const COOKIE_KEY = 'preferred-locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 dias

type TranslationContextValue = {
  locale: Locale;
  t: Translation;
  mounted: boolean;
  setLocale: (locale: Locale) => void;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

function isValidLocale(locale: string | null | undefined): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}

function readLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_KEY}=`));

  if (!cookie) return null;
  const value = cookie.split('=')[1];
  return isValidLocale(value) ? (value as Locale) : null;
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  const cookieLocale = readLocaleFromCookie();
  if (cookieLocale) return cookieLocale;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isValidLocale(stored) ? (stored as Locale) : null;
}

export function persistLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}`;
    document.documentElement.lang = locale;
  } catch (error) {
    // Persistência é best-effort; não quebrar UI por causa disso.
    console.error('[translations] failed to persist locale', error);
  }
}

export function TranslationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // i18n temporariamente desativado: força locale pt-BR
  // mas mantém mounted = false inicialmente para evitar hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = useMemo(
    () => ({
      locale: 'pt-BR' as Locale,
      t: translationsMap['pt-BR'],
      mounted,
      setLocale: (_next: Locale) => {
        // no-op enquanto i18n estiver desativado
        void _next;
      },
    }),
    [mounted]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslations must be used within TranslationsProvider');
  }

  return context;
}
