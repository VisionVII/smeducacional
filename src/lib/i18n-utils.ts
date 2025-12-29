import { type Locale, currencyMap, currencySymbolMap } from '@/i18n';

/**
 * Formata preço baseado no locale
 */
export function formatPrice(
  amount: number,
  locale: Locale = 'pt-BR',
  currency?: string
): string {
  const curr = currency || currencyMap[locale];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Converte preço entre moedas (simplificado - usar API de câmbio em produção)
 */
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  // Taxas de câmbio aproximadas (atualizar com API real)
  const rates: Record<string, number> = {
    BRL: 1.0,
    USD: 0.2, // 1 BRL = 0.20 USD
    EUR: 0.18, // 1 BRL = 0.18 EUR
    MXN: 3.5, // 1 BRL = 3.5 MXN
    ARS: 160.0, // 1 BRL = 160 ARS
    GBP: 0.16, // 1 BRL = 0.16 GBP
    CAD: 0.27, // 1 BRL = 0.27 CAD
    AUD: 0.3, // 1 BRL = 0.30 AUD
    JPY: 29.0, // 1 BRL = 29 JPY
  };

  // Converter para BRL primeiro, depois para moeda de destino
  const inBRL = amount / (rates[fromCurrency] || 1);
  return inBRL * (rates[toCurrency] || 1);
}

/**
 * Pega símbolo da moeda
 */
export function getCurrencySymbol(currency: string): string {
  return currencySymbolMap[currency] || currency;
}

/**
 * Formata preço com conversão automática
 */
export function formatPriceWithConversion(
  amount: number,
  fromCurrency: string,
  locale: Locale = 'pt-BR'
): string {
  const toCurrency = currencyMap[locale];
  const converted = convertPrice(amount, fromCurrency, toCurrency);
  return formatPrice(converted, locale, toCurrency);
}
