# 🎬 GUIA DE ANIMAÇÕES - Exemplos Práticos

## 🎨 Comparação Visual dos Presets

### Preset 1: **Sistema Padrão** (Recomendado)

```json
{
  "duration": "normal", // 200ms
  "easing": "ease-in-out", // Suave
  "transitions": ["all"], // Tudo anima
  "pageTransitions": true // Páginas com fade
}
```

**Visual:** Botões sobem suavemente ao hover, cards viram sombra, transições page fade
**Melhor para:** Dashboard geral, áreas administrativas
**Sensação:** Profissional e responsivo

---

### Preset 2: **Oceano** (Material Design)

```json
{
  "duration": "normal",
  "easing": "cubic-bezier(0.4, 0, 0.2, 1)", // Material Design
  "transitions": ["all"],
  "pageTransitions": true
}
```

**Visual:** Elevações dinâmicas, ripples ao clicar, transições matemáticas
**Melhor para:** Interfaces modernas, material design
**Sensação:** Elegante e controlada

---

### Preset 3: **Pôr do Sol** (Interativo Rápido)

```json
{
  "duration": "fast", // 100ms ⚡
  "easing": "ease-out",
  "transitions": ["colors", "opacity"], // Apenas cor e opacidade
  "pageTransitions": false // Sem transição de página
}
```

**Visual:** Mudanças de cor instantâneas, sem lag, interface ágil
**Melhor para:** Aplicações em tempo real, mobile
**Sensação:** Responsiva e leve

---

### Preset 4: **Floresta** (Educacional)

```json
{
  "duration": "slow", // 500ms 🌿
  "easing": "ease-in-out",
  "transitions": ["all"],
  "pageTransitions": true
}
```

**Visual:** Transições generosas que a gente vê acontecer, relaxante
**Melhor para:** Conteúdo educacional, vídeos, material pedagógico
**Sensação:** Calma e natural

---

### Preset 5: **Meia-Noite** (Artístico)

```json
{
  "duration": "normal",
  "easing": "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // BOUNCE!
  "transitions": ["transforms", "opacity"],
  "pageTransitions": true
}
```

**Visual:** Elementos "quicam" ao aparecer, efeito elástico, dinâmico
**Melhor para:** Landing pages, portfólio, design criativo
**Sensação:** Moderna e expressiva

---

### Preset 6: **Minimalista** (Sem Movimento)

```json
{
  "enabled": false, // ❌ NENHUMA ANIMAÇÃO
  "duration": "fast",
  "transitions": [],
  "hover": false,
  "focus": false,
  "pageTransitions": false
}
```

**Visual:** Transições instantâneas, zero movimento, super clean
**Melhor para:** Interfaces extremamente focadas, acessibilidade
**Sensação:** Direta e sem distrações

---

### Presets 7-9: **Dark Themes** (Escuros)

Todas com variações de dark mode:

**Slate Escuro:**

```json
{
  "duration": "normal",
  "easing": "ease-in-out",
  "transitions": ["all"],
  "pageTransitions": true
}
```

Sofisticado para temas escuros profissionais

**Roxo Noturno:**

```json
{
  "duration": "normal",
  "easing": "cubic-bezier(0.4, 0, 0.2, 1)", // Material
  "transitions": ["all"]
}
```

Vibrante e moderno

**Esmeralda Escuro:**

```json
{
  "duration": "normal",
  "easing": "ease-in-out",
  "transitions": ["colors", "opacity"]
}
```

Suave e refinado

---

## 💻 Usando em Componentes

### Opção 1: Componente com Animação Automática

```tsx
export function TeacherCard() {
  return (
    <div className="transition-theme hover:shadow-lg">
      {/* Animação automática aplicada com:
          - Duration: var(--transition-duration)
          - Easing: var(--transition-easing)
      */}
      <h2>Seu Conteúdo</h2>
    </div>
  );
}
```

**O que acontece:**

- Hover: shadow muda suavemente
- Duração e easing vêm do tema ativo
- Se tema desabilitar animações → acontece instantaneamente

---

### Opção 2: Customizar Animação Específica

```tsx
export function Button() {
  const { theme } = useTeacherTheme();

  const animationDuration =
    theme?.animations?.duration === 'slow'
      ? '500ms'
      : theme?.animations?.duration === 'fast'
      ? '100ms'
      : '200ms';

  return (
    <button
      style={{
        transition: `all ${animationDuration} ease-in-out`,
      }}
    >
      Customizado
    </button>
  );
}
```

---

### Opção 3: Respeitar Preferência do Usuário

```tsx
export function Dialog() {
  const { theme } = useTeacherTheme();

  // Respeitar se usuario desabilitou animações
  if (!theme?.animations?.enabled) {
    return <DialogWithoutAnimation />;
  }

  return <DialogWithAnimation />;
}
```

---

## 🧪 Testando Animações

### Teste 1: Mudar de Tema

1. Acesse `/teacher/theme`
2. Selecione diferentes presets
3. Observe as diferenças de velocidade nas transições
4. Note a diferença entre "Minimalista" e "Floresta"

### Teste 2: Testar Velocidades

```bash
# Abrir no mobile (simulador)
- Floresta (slow): Vira muito lento?
- Pôr do Sol (fast): Desaparece muito rápido?
- Sistema Padrão: Está bom?
```

### Teste 3: Acessibilidade

```bash
# Verificar se respeita prefers-reduced-motion
# (Implementar no futuro)
```

---

## 🚀 Performance Tips

### ✅ BOM

```typescript
// Usar transition-theme (aplica duration e easing)
<button className="transition-theme">Bom</button>
```

### ⚠️ CUIDADO

```typescript
// Animar muitas propriedades
transition: all 500ms ease-in-out;  // Heavy!

// Melhor:
transition: transform 200ms, opacity 200ms;  // Light
```

### ❌ RUIM

```typescript
// Keyframes complexas a cada 100ms
@keyframes complex { ... }
animation: complex 100ms;  // CPU overload

// Melhor: usar transform + transition
```

---

## 📊 Comparação Rápida

| Preset      | Velocidade | Efeito       | Caso de Uso        |
| ----------- | ---------- | ------------ | ------------------ |
| Padrão      | 200ms      | Suave        | Geral              |
| Oceano      | 200ms      | Material     | Design moderno     |
| Pôr do Sol  | 100ms      | Rápido       | Mobile/Real-time   |
| Floresta    | 500ms      | Relaxado     | Educação           |
| Meia-Noite  | 200ms      | Bounce       | Landing page       |
| Minimalista | 0ms        | Nenhum       | Minimalismo        |
| Slate       | 200ms      | Profissional | Dark mode          |
| Roxo        | 200ms      | Vibrante     | Dark mode criativo |
| Esmeralda   | 200ms      | Suave        | Dark mode refinado |

---

## 🎯 Próximas Integrações (Roadmap)

### Fase 1: Animações em Componentes Comuns

- [ ] Dialog com fade in/out
- [ ] Dropdown com slide
- [ ] Toast com pop-in
- [ ] Skeleton loading com pulse

### Fase 2: Page Transitions

- [ ] Fade entre páginas
- [ ] Slide horizontal
- [ ] Scale + fade
- [ ] Respectar `--page-transitions` flag

### Fase 3: Micro-interactions

- [ ] Hover states customizáveis
- [ ] Loading spinners animados
- [ ] Form validation feedback
- [ ] Success/Error animations

### Fase 4: Acessibilidade

- [ ] Respeitar `prefers-reduced-motion`
- [ ] Fallbacks para navegadores antigos
- [ ] Performance testing
- [ ] Battery impact analysis (mobile)

---

## 💡 Dicas Criativas

### Criar um Tema Único

```typescript
const meuTelaPersonalizado: TeacherTheme = {
  palette: {
    // Cores únicas...
  },
  layout: {
    // Espaçamento único...
  },
  animations: {
    enabled: true,
    duration: 'normal',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Sua própria curva!
    transitions: ['transforms'], // Apenas transformações
    hover: true,
    focus: true,
    pageTransitions: true,
  },
};
```

### Desabilitar Animações para Usuários Específicos

```typescript
// Detectar preferência do sistema
const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const theme = {
  ...baseTheme,
  animations: {
    ...baseTheme.animations,
    enabled: !prefersReduced, // Respeitar preferência do SO
  },
};
```

---

## ✨ Conclusão

O sistema de animações oferece **9 presets prontos** + **infinitas customizações** via CSS variables. Cada tema pode ter sua própria "personalidade de movimento" sem código extra!

**Server rodando em:** `http://localhost:3001`
**Documentação:** `/ANIMATIONS_SYSTEM_COMPLETE.md`
**Status:** ✅ Pronto para uso em produção
