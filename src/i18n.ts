import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Locales suportados
export const locales = ['pt-BR', 'en-US', 'es-ES'] as const;
export type Locale = (typeof locales)[number];

// Locale padrão
export const defaultLocale: Locale = 'pt-BR';

// Mapa de moedas por locale
export const currencyMap: Record<Locale, string> = {
  'pt-BR': 'BRL',
  'en-US': 'USD',
  'es-ES': 'EUR',
};

// Símbolos de moeda
export const currencySymbolMap: Record<string, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  MXN: 'MX$',
  ARS: 'AR$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = (locale ?? defaultLocale) as Locale;

  // Validar locale
  if (!locales.includes(activeLocale)) {
    notFound();
  }

  const messages = (await import(`../messages/${activeLocale}.json`)).default;

  return {
    locale: activeLocale,
    messages,
  };
});
