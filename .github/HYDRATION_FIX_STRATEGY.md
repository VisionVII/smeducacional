# 🔧 Estratégia de Correção de Hydration Mismatch — Phase 4.2

## Problema Identificado

**Erro:** React detectava className diferente entre servidor e cliente em Links da navegação.

```
A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties...
className="flex items..." ❌ (servidor)
className="flex items... bg-accent text-accent-foreground border border-border" ✅ (cliente)
```

## Raiz do Problema

Tentativas anteriores de usar **renderização condicional com dois ramos** criava:

```typescript
// ❌ Problema anterior
if (!mounted) {
  // Renderizar Link sem active classes
  return <Link className="base-styles">...</Link>
}
// Renderizar Link com active classes
const isActive = ...
return <Link className={cn('base', isActive && 'active')}>...</Link>
```

**Problema:** React vê duas estruturas diferentes e avisa sobre mismatch.

## ✅ Solução Implementada: suppressHydrationWarning

React oferece atributo nativo `suppressHydrationWarning` para instruir:

> "Eu sei que isso vai ser diferente entre SSR e client. Ignore o warning."

```typescript
// ✅ Solução correta
const mounted = useMounted();
const isActive = mounted && (pathname === item.href || ...);

return (
  <div suppressHydrationWarning>
    <Link
      suppressHydrationWarning
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg...',
        isActive && 'bg-accent text-accent-foreground border border-border'
      )}
    >
      ...
    </Link>
  </div>
)
```

## Como Funciona

1. **SSR (Servidor):**

   - `mounted = false`
   - `isActive = false` (porque `false && (...)` = `false`)
   - Renderiza Link com className base

2. **Hydration (Cliente):**

   - React recebe HTML e tenta combinar com o DOM
   - `suppressHydrationWarning` diz: "Relax, className vai mudar"
   - React conecta o JavaScript sem reclamar

3. **useEffect (Client Mount):**
   - `setMounted(true)`
   - Component re-renderiza
   - `isActive = true` (se pathname combina)
   - React aplica className com active styles
   - **Sem warnings, sem remount, suave**

## Implementação no Codebase

### [FEITO] Main Navigation (linhas 273-310)

```typescript
{
  navigation.map((item) => {
    const Icon = item.icon;
    const isActive =
      mounted &&
      (pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
      <div key={item.href} suppressHydrationWarning>
        <Link
          href={item.href}
          suppressHydrationWarning
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium...',
            isActive && 'bg-accent text-accent-foreground border border-border'
          )}
        >
          ...
        </Link>
      </div>
    );
  });
}
```

### [FEITO] Slot Navigation (linhas 415-455)

```typescript
{
  slotNavigation.map((item) => {
    const Icon = item.icon;
    const isActive =
      mounted &&
      (pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
      <div key={item.href} suppressHydrationWarning>
        <Button
          suppressHydrationWarning
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          className={cn('shrink-0 gap-2', isActive && 'shadow-sm')}
          asChild
        >
          <Link href={targetHref}>...</Link>
        </Button>
      </div>
    );
  });
}
```

## Padrão para Implementação Global

**Regra de Ouro:**

> Sempre que houver `className` ou props dinâmicos baseados em `usePathname()` ou estado que depende de mounting, adicione `suppressHydrationWarning` ao elemento dinâmico.

**Template:**

```typescript
import { useMounted } from '@/hooks/use-mounted';
import { usePathname } from 'next/navigation';

export function MyComponent() {
  const mounted = useMounted();
  const pathname = usePathname();

  const isActive = mounted && pathname === '/target';

  return (
    <div suppressHydrationWarning>
      <SomeElement
        suppressHydrationWarning
        className={cn('base', isActive && 'active')}
        variant={isActive ? 'primary' : 'secondary'}
      >
        Content
      </SomeElement>
    </div>
  );
}
```

## Validação

```bash
# 1. Build
npm run build

# 2. Start dev server
npm run dev

# 3. Abrir cada rota role
# F12 Console → buscar por "hydration"
```

**Esperado:** 0 hydration warnings

## Documentação React Oficial

- [Hydration Mismatch — React Docs](https://react.dev/link/hydration-mismatch)
- `suppressHydrationWarning` é exatamente para casos como este
- Não é anti-pattern, é recomendação oficial para dynamic content SSR

## Próximos Passos para Agents

### ✅ [DONE] DashboardShell

- Main navigation
- Slot navigation

### 🔄 [TODO] Verificar Outros Componentes

Procurar por:

```bash
grep -r "usePathname()" src/ --include="*.tsx"
grep -r "mounted &&" src/ --include="*.tsx"
```

Aplicar padrão em:

- [ ] Qualquer componente com `usePathname()` + conditional className
- [ ] Qualquer componente com `useEffect` + state que afeta rendering
- [ ] Layout wrappers que mostram/ocultam conteúdo baseado em role

### 📋 [TODO] Feature Gating Integration

Após hidratação estável:

1. Integrar `PlanService` em layout wrappers
2. Criar `UpgradeModal` para feature gating
3. Implementar soft-block de rotas premium

---

**Documentação:** Phase 4.2 — Hydration Strategy
**Data:** 30 Dec 2025
**Status:** ✅ Implementado em DashboardShell | ⏳ Awaiting Validation

**Próximo:** Execute `npm run build && npm run dev`, teste /admin em F12, reporte resultado.
