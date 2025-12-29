'use client';

import { useTranslationContext } from '@/components/translations-provider';

export function useTranslations() {
  return useTranslationContext();
}
