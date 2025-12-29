'use client';

import { useTranslations } from '@/hooks/use-translations';

type ClientTextProps = {
  path: string;
  variables?: Record<string, string | number>;
};

// Lightweight client bridge to render translations inside the server page
export function ClientText({ path, variables }: ClientTextProps) {
  const { t } = useTranslations();
  const segments = path.split('.');

  let value: unknown = t;
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in value) {
      value = (value as Record<string, unknown>)[segment];
    } else {
      value = path; // fallback shows the key
      break;
    }
  }

  let text = String(value);
  if (variables) {
    for (const [key, val] of Object.entries(variables)) {
      text = text.replace(new RegExp(`{${key}}`, 'g'), String(val));
    }
  }

  return <>{text}</>;
}
