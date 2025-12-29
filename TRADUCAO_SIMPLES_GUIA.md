# 🌍 Guia de Tradução Simplificado - SM Educa

## 📋 Sistema Atual

O sistema i18n foi simplificado para funcionar **sem rotas localizadas** (`/pt-BR`, `/en-US`).

### ✅ Como Funciona Agora:

1. **LanguageSelector** - Salva preferência em `localStorage`
2. **CurrencyProvider** - Sincroniza moeda com idioma
3. **Traduções Client-Side** - Recarrega página ao trocar idioma

### 🎯 Vantagens:

- ✅ Sem conflito com middleware de autenticação
- ✅ Sem estrutura complexa de rotas `[locale]`
- ✅ Mantém URLs simples (`/courses` em vez de `/pt-BR/courses`)
- ✅ Funciona imediatamente

---

## 🔧 Como Usar Traduções

### 1. Importar Traduções no Componente

```tsx
'use client';

import { useState, useEffect } from 'react';
import translations from '@/messages/pt-BR.json';
import translationsEN from '@/messages/en-US.json';
import translationsES from '@/messages/es-ES.json';

function MyComponent() {
  const [locale, setLocale] = useState('pt-BR');
  const [t, setT] = useState(translations);

  useEffect(() => {
    // Carregar idioma do localStorage
    const saved = localStorage.getItem('preferred-locale') || 'pt-BR';
    setLocale(saved);

    // Carregar traduções correspondentes
    if (saved === 'en-US') {
      setT(translationsEN);
    } else if (saved === 'es-ES') {
      setT(translationsES);
    } else {
      setT(translations);
    }
  }, []);

  return (
    <div>
      <h1>{t.home.hero.title}</h1>
      <p>{t.home.hero.subtitle}</p>
      <button>{t.common.save}</button>
    </div>
  );
}
```

### 2. Criar Hook Customizado (Recomendado)

Crie `src/hooks/use-translations.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import pt from '@/messages/pt-BR.json';
import en from '@/messages/en-US.json';
import es from '@/messages/es-ES.json';

const translationsMap = {
  'pt-BR': pt,
  'en-US': en,
  'es-ES': es,
};

export function useTranslations() {
  const [locale, setLocale] = useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-locale') as any;
      if (saved && translationsMap[saved]) {
        setLocale(saved);
      }
    }
  }, []);

  const t = translationsMap[locale];

  return { t, locale, mounted };
}
```

### 3. Usar o Hook na Página

```tsx
'use client';

import { useTranslations } from '@/hooks/use-translations';

export default function HomePage() {
  const { t, mounted } = useTranslations();

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{t.home.hero.title}</h1>
      <p>{t.home.hero.subtitle}</p>
      <button>{t.common.explore}</button>
    </div>
  );
}
```

---

## 📁 Estrutura de Traduções

```json
{
  "common": {
    "loading": "Carregando...",
    "save": "Salvar",
    "cancel": "Cancelar"
  },
  "home": {
    "hero": {
      "title": "Título",
      "subtitle": "Subtítulo"
    }
  }
}
```

---

## 💰 Formatação de Preços

Use o `formatPrice` de `@/lib/i18n-utils`:

```tsx
import { formatPrice } from '@/lib/i18n-utils';
import { useCurrency } from '@/components/currency-provider';

function PriceDisplay({ amount }: { amount: number }) {
  const { locale, currency } = useCurrency();

  return <div>{formatPrice(amount, locale, currency)}</div>;
}
```

---

## 🔄 Fluxo Completo

1. **Usuário clica no LanguageSelector**
2. **Idioma salvo no localStorage**: `preferred-locale: 'en-US'`
3. **Moeda atualizada automaticamente**: USD (via CurrencyProvider)
4. **Página recarrega**: `window.location.reload()`
5. **Componentes leem localStorage**: Exibem traduções corretas

---

## 🚀 Próximos Passos (Opcional)

Se quiser **rotas localizadas** no futuro:

1. Criar estrutura `src/app/[locale]/page.tsx`
2. Integrar `next-intl` middleware com autenticação
3. Usar `NextIntlClientProvider`
4. Migrar para `useTranslations()` do next-intl

---

## 📝 Exemplo Completo

Veja `src/components/language-selector.tsx` e `src/components/currency-provider.tsx` como referência.

### Testado e Funcionando:

✅ Troca de idioma sem redirecionamento forçado  
✅ Persistência em localStorage  
✅ Sincronização moeda/idioma  
✅ Sem erros de hydration  
✅ Compatível com middleware de autenticação
