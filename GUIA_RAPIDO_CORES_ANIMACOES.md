# 🚀 GUIA RÁPIDO - USANDO O SISTEMA DE CORES E ANIMAÇÕES

## ⚡ Quick Start (2 minutos)

### 1. Tesar no Navegador

```bash
npm run dev
# Acesse: http://localhost:3000/test
```

### 2. Ver as Cores Funcionando

- Clique em um tema diferente
- Observe as cores mudarem em tempo real
- Verifique as animações ao passar o mouse

### 3. No Seu Código

```tsx
// Use a classe transition-theme para animar
<button className="transition-theme hover:bg-primary">
  Com animação
</button>

<div className="transition-colors-theme">
  Apenas cores animadas
</div>
```

## 🎨 Acessar as Cores em um Componente

### Método 1: Usar Tailwind CSS

```tsx
<div className="bg-primary text-primary-foreground">
  Usa as cores do tema automaticamente
</div>
```

### Método 2: Usar CSS Variables

```tsx
<div style={{ color: 'hsl(var(--primary))' }}>Cor primária do tema</div>
```

### Método 3: Usar getComputedStyle

```typescript
const primaryColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--primary');
```

## 🎭 Adicionar um Novo Preset

1. **Abra** `src/lib/theme-presets.ts`

2. **Copie um preset existente:**

```typescript
export const MeuTemaPreset: ThemePreset = {
  id: 'meu-tema',
  name: 'Meu Tema',
  colors: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    // ... outras cores ...
  },
  layout: {
    cardStyle: 'bordered',
    shadowIntensity: 'light',
    spacing: 'comfortable',
    borderRadius: '0.75rem',
  },
  animations: {
    enabled: true,
    duration: 'normal',
    easing: 'ease-in-out',
    transitions: ['all'],
    hover: true,
    focus: true,
    pageTransitions: true,
  },
};
```

3. **Adicione ao array de presets:**

```typescript
export const THEME_PRESETS = [
  PadraoPreset,
  OceanoPreset,
  // ... outros ...
  MeuTemaPreset, // 👈 Novo
];
```

## ⏱️ Customizar Duração de Animação

1. **No preset, mude a duração:**

```typescript
animations: {
  duration: 'slow', // 'slow' | 'normal' | 'fast'
  // ...
}
```

2. **Mapeamento automático:**
   - `slow` → 500ms
   - `normal` → 200ms
   - `fast` → 100ms

## 🎯 Desabilitar Animações Globalmente

1. **No preset:**

```typescript
animations: {
  enabled: false, // Desabilita todas as animações
  // ...
}
```

2. **Ou no CSS (fallback):**

```css
:root:not(.animations-enabled) {
  * {
    transition: none !important;
  }
}
```

## 🔧 Customizar Easing

1. **No preset, use um dos valores predefinidos:**

```typescript
animations: {
  easing: 'ease-in-out' | 'ease-in' | 'ease-out',
  // ...
}
```

2. **Ou use cubic-bezier customizado:**

```typescript
animations: {
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  // ...
}
```

## 📋 Controles Granulares

```typescript
animations: {
  enabled: true,              // Ativa/desativa tudo
  duration: 'normal',
  easing: 'ease-in-out',
  transitions: ['all'],
  hover: true,                // Animar em hover
  focus: true,                // Animar em focus
  pageTransitions: true,      // Animar mudança de página
}
```

## 💡 Exemplos Práticos

### Exemplo 1: Button com Animação

```tsx
<button
  className="
    bg-primary text-primary-foreground 
    transition-theme 
    hover:bg-accent 
    hover:shadow-lg
    px-4 py-2 rounded-lg
  "
>
  Clique para ver animação
</button>
```

### Exemplo 2: Card com Transição de Cores

```tsx
<div
  className="
    bg-card text-card-foreground 
    transition-colors-theme
    border border-border
    rounded-lg p-4
    hover:bg-primary hover:text-primary-foreground
  "
>
  Card interativo
</div>
```

### Exemplo 3: Hero com Page Transition

```tsx
<section
  className="
    min-h-screen 
    bg-gradient-to-r from-primary to-accent
    transition-theme
    flex items-center justify-center
  "
>
  <h1 className="text-4xl font-bold text-white">Bem-vindo</h1>
</section>
```

## 🧪 Validar Implementação

```bash
# Executar testes de validação
node scripts/test-themes.js

# Resultado esperado: 8/8 testes passam ✅
```

## 📚 Cores Disponíveis

```
background           foreground
primary              primaryForeground
secondary            secondaryForeground
accent               accentForeground
card                 cardForeground
muted                mutedForeground
border               input (derivado)
```

## 🎬 Transições Disponíveis

```
.transition-theme           /* Todos os properties */
.transition-colors-theme    /* Apenas colors */
```

## ⚙️ CSS Variables Injetadas

```css
:root {
  --transition-duration: 200ms | 500ms | 100ms
  --transition-easing: ease-in-out | cubic-bezier(...)
  --animations-enabled: 1 | (removido)
  --hover-animations: 1 | 0
  --focus-animations: 1 | 0
  --page-transitions: 1 | 0
}
```

## 🐛 Troubleshooting

### Cores não estão mudando?

```bash
# 1. Regenerar Prisma Client
npm run db:generate

# 2. Reiniciar o servidor
npm run dev
```

### Animações não funcionam?

```bash
# Verificar se .transition-theme está aplicado
# Abrir DevTools (F12)
# Inspecionar elemento
# Verificar classe e computed styles
```

### CSS Variables não aparecem?

```javascript
// No console do navegador
getComputedStyle(document.documentElement);
```

## 📖 Arquivo de Referência

- **theme-presets.ts** - Define cores e animações
- **teacher-theme-provider.tsx** - Aplica temas dinamicamente
- **globals.css** - CSS variables e utilities
- **schema.prisma** - Estrutura de dados

## ✅ Checklist para Novo Preset

- [ ] ID único (lowercase, sem espaços)
- [ ] Name descritivo
- [ ] 12 cores em formato HSL
- [ ] Layout options customizadas
- [ ] Animations configuradas
- [ ] Adicionado ao array THEME_PRESETS
- [ ] Testado no /test page

---

_Documentação rápida criada em 2024_
_Para mais detalhes, veja VALIDACAO_CORES_ANIMACOES.md_
