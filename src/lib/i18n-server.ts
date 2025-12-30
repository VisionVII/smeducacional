import ptJson from '../../messages/pt-BR.json';
import enJson from '../../messages/en-US.json';
import esJson from '../../messages/es-ES.json';
import { type Locale } from '@/lib/locales';

export type Translation = typeof ptJson;

export const translationsMap: Record<Locale, Translation> = {
  'pt-BR': ptJson as Translation,
  'en-US': enJson as unknown as Translation,
  'es-ES': esJson as unknown as Translation,
};

export function getServerTranslations(locale: Locale = 'pt-BR') {
  return {
    t: translationsMap[locale],
    locale,
  };
}
