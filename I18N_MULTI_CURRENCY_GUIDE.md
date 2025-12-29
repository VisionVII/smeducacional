# 🌍 Sistema de Internacionalização (i18n) & Multi-Moeda

## 📋 Visão Geral

Sistema completo de internacionalização com suporte a **múltiplos idiomas e moedas**, conversão automática de preços e seletor de idioma inteligente.

---

## 🎯 Funcionalidades

### 1. **Multi-Idioma**

- ✅ **3 idiomas suportados**:
  - 🇧🇷 Português (Brasil) - `pt-BR`
  - 🇺🇸 English (US) - `en-US`
  - 🇪🇸 Español - `es-ES`
- ✅ Detecção automática de idioma
- ✅ Seletor de idioma no Navbar
- ✅ Persistência de preferência no localStorage

### 2. **Multi-Moeda**

- ✅ **9 moedas suportadas**:
  - BRL (Real Brasileiro) - R$
  - USD (Dólar Americano) - $
  - EUR (Euro) - €
  - MXN (Peso Mexicano) - MX$
  - ARS (Peso Argentino) - AR$
  - GBP (Libra Esterlina) - £
  - CAD (Dólar Canadense) - C$
  - AUD (Dólar Australiano) - A$
  - JPY (Iene Japonês) - ¥
- ✅ Conversão automática de preços
- ✅ Formatação correta por locale

### 3. **Admin - Configuração de Preços**

- ✅ Definir preços em múltiplas moedas
- ✅ Preços específicos por país
- ✅ Atualização em lote de preços
- ✅ Preview de conversões

---

## 📁 Estrutura de Arquivos

```
/messages
  ├── pt-BR.json          # Traduções Português
  ├── en-US.json          # Traduções Inglês
  └── es-ES.json          # Traduções Espanhol

/src
  ├── i18n.ts             # Configuração next-intl
  ├── /lib
  │   └── i18n-utils.ts   # Utils de formatação/conversão
  ├── /components
  │   ├── language-selector.tsx  # Seletor de idioma
  │   └── currency-provider.tsx  # Context de moeda
```

---

## 🛠️ Como Usar

### 1. **Usar traduções em componentes**

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('nav');

  return <h1>{t('home')}</h1>; // "Início" (pt-BR)
}
```

### 2. **Formatar preços**

```tsx
import { formatPrice } from '@/lib/i18n-utils';

const price = formatPrice(99.9, 'pt-BR', 'BRL');
// Output: "R$ 99,90"
```

### 3. **Converter preços entre moedas**

```tsx
import { convertPrice } from '@/lib/i18n-utils';

const priceInUSD = convertPrice(100, 'BRL', 'USD');
// 100 BRL → ~20 USD
```

### 4. **Formatar com conversão automática**

```tsx
import { formatPriceWithConversion } from '@/lib/i18n-utils';

const formatted = formatPriceWithConversion(100, 'BRL', 'en-US');
// Output: "$20.00"
```

### 5. **Usar contexto de moeda**

```tsx
import { useCurrency } from '@/components/currency-provider';

export function PriceDisplay({ amount }: { amount: number }) {
  const { currency, locale } = useCurrency();

  return <span>{formatPrice(amount, locale, currency)}</span>;
}
```

---

## 🌐 Estrutura de URLs

As URLs seguem o padrão:

```
/{locale}/{path}

Exemplos:
/pt-BR/              → Página inicial (Português)
/en-US/courses       → Cursos (Inglês)
/es-ES/about         → Sobre (Espanhol)
```

---

## 🔧 Configuração Admin

### Definir Preços Multi-Moeda

**Endpoint**: `PUT /api/admin/stripe-config`

```json
{
  "pricesByCountry": [
    {
      "country": "BR",
      "currency": "BRL",
      "basicPrice": 9900,
      "proPrice": 19900,
      "premiumPrice": 39900
    },
    {
      "country": "US",
      "currency": "USD",
      "basicPrice": 1900,
      "proPrice": 3900,
      "premiumPrice": 7900
    },
    {
      "country": "ES",
      "currency": "EUR",
      "basicPrice": 1700,
      "proPrice": 3500,
      "premiumPrice": 7000
    }
  ]
}
```

### UI Admin - Configurar Preços

1. Acesse `/admin/plans/stripe`
2. Aba **"Preços por País"**
3. Adicione país, moeda e valores
4. Salve

---

## 📊 Mapeamento Locale → Moeda

| Locale  | Idioma    | Moeda Padrão |
| ------- | --------- | ------------ |
| `pt-BR` | Português | BRL (R$)     |
| `en-US` | English   | USD ($)      |
| `es-ES` | Español   | EUR (€)      |

---

## 🎨 Componentes UI

### LanguageSelector

Seletor de idioma com dropdown:

```tsx
import { LanguageSelector } from '@/components/language-selector';

<LanguageSelector />;
```

**Features**:

- 🌐 Detecta idioma atual da URL
- 💾 Salva preferência no localStorage
- 🔄 Atualiza URL automaticamente
- ✅ Indica idioma ativo

---

## 🔄 Conversão de Moedas

### Taxas de Câmbio (Aproximadas)

| De \ Para | BRL | USD  | EUR  | MXN  | ARS |
| --------- | --- | ---- | ---- | ---- | --- |
| **BRL**   | 1.0 | 0.20 | 0.18 | 3.5  | 160 |
| **USD**   | 5.0 | 1.0  | 0.90 | 17.5 | 800 |
| **EUR**   | 5.5 | 1.1  | 1.0  | 19.4 | 890 |

**⚠️ IMPORTANTE**: Em produção, use uma API de câmbio real (ex: [ExchangeRate-API](https://www.exchangerate-api.com/)).

### Integração com API de Câmbio

```typescript
// src/lib/exchange-rate.ts
export async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  const data = await response.json();
  return data.rates[to];
}
```

---

## 📝 Adicionando Novos Idiomas

### 1. Criar arquivo de tradução

```bash
# Copie template
cp messages/pt-BR.json messages/fr-FR.json

# Edite traduções
nano messages/fr-FR.json
```

### 2. Atualizar configuração

```typescript
// src/i18n.ts
export const locales = ['pt-BR', 'en-US', 'es-ES', 'fr-FR'] as const;

export const currencyMap: Record<Locale, string> = {
  'pt-BR': 'BRL',
  'en-US': 'USD',
  'es-ES': 'EUR',
  'fr-FR': 'EUR', // Novo
};
```

### 3. Adicionar ao seletor

```typescript
// src/components/language-selector.tsx
const languages = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' }, // Novo
];
```

---

## 🧪 Testes

### Testar Mudança de Idioma

1. Acesse qualquer página
2. Clique no seletor de idioma (🌐)
3. Selecione idioma diferente
4. Verifique se URL mudou
5. Verifique se traduções atualizaram

### Testar Conversão de Preços

```tsx
// Teste unitário
import { convertPrice } from '@/lib/i18n-utils';

describe('convertPrice', () => {
  it('converte BRL para USD', () => {
    const result = convertPrice(100, 'BRL', 'USD');
    expect(result).toBeCloseTo(20, 0);
  });

  it('retorna mesmo valor para mesma moeda', () => {
    const result = convertPrice(100, 'BRL', 'BRL');
    expect(result).toBe(100);
  });
});
```

---

## 🎯 Próximos Passos

### Fase 1 - Básico ✅

- [x] Instalar next-intl
- [x] Criar arquivos de tradução (pt-BR, en-US, es-ES)
- [x] Configurar i18n
- [x] Criar utils de formatação/conversão
- [x] Componente LanguageSelector
- [x] Context de moeda

### Fase 2 - Integração (Em progresso)

- [ ] Adicionar seletor no Navbar
- [ ] Traduzir páginas principais
- [ ] Adaptar admin para preços multi-moeda
- [ ] Middleware de detecção de locale

### Fase 3 - Avançado

- [ ] Integrar API de câmbio real
- [ ] Cache de taxas de conversão
- [ ] Detecção geográfica (IP → País → Moeda)
- [ ] Preços dinâmicos por região
- [ ] Analytics de preferências de idioma

---

## 🆘 Troubleshooting

### Traduções não aparecem

**Causa**: Arquivo JSON inválido ou chave não existe.

**Solução**:

```bash
# Validar JSON
cat messages/pt-BR.json | jq .

# Verificar chave
grep -r "keyName" messages/
```

### Conversão de preços incorreta

**Causa**: Taxas de câmbio desatualizadas.

**Solução**: Integrar API de câmbio real (ver seção "Integração com API de Câmbio").

### Seletor de idioma não muda URL

**Causa**: Router não está navegando corretamente.

**Solução**: Verificar se `useRouter()` é do `next/navigation` (não `next/router`).

---

## 📚 Referências

- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [ExchangeRate-API](https://www.exchangerate-api.com/)
- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)

---

**Desenvolvido com excelência pela VisionVII** — Soluções que impactam positivamente através da tecnologia.
