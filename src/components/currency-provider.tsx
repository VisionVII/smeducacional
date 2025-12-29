'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Locale, currencyMap } from '@/i18n';

interface CurrencyContextType {
  currency: string;
  locale: Locale;
  setCurrency: (currency: string) => void;
  setLocale: (locale: Locale) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({
  children,
  initialLocale = 'pt-BR',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<string>(
    currencyMap[initialLocale]
  );

  // Sincronizar moeda com locale
  useEffect(() => {
    setCurrencyState(currencyMap[locale]);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
    }
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-currency', newCurrency);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, locale, setCurrency, setLocale }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
