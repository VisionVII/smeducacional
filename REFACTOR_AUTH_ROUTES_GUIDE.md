# 🎯 Refactor das Rotas de Auth

## Credenciais de Teste Atualizadas

```
✅ Admin
📧 admin@smeducacional.com
🔑 admin123

✅ Professor
📧 professor@smeducacional.com
🔑 teacher123

✅ Aluno
📧 aluno@smeducacional.com
🔑 student123
```

---

## Problemas Identificados

### 1. Login (src/app/login/page.tsx)

- ❌ Card overflow em mobile
- ❌ Hero section toma espaço desnecessário
- ❌ Scroll vertical em viewports pequenos
- ✅ Solução: Layout coluna em mobile, remover hero em <768px

### 2. Registro (src/app/register/page.tsx)

- ❌ Mesmo problema do login
- ❌ Carrossel de cursos toma espaço
- ✅ Solução: Ocultar em mobile, simplificar

### 3. Recuperar Senha (src/app/forgot-password/page.tsx)

- ❌ Card aninhado (erro de parse já corrigido)
- ❌ Layout complexo em mobile
- ✅ Solução: Versão simplificada para mobile

---

## Estratégia de Refactor

### Para Mobile (<768px):

```tsx
// Desktop: flex row com hero + form lado a lado
// Mobile: flex col, ocultar hero, form 100% viewport

<div className="min-h-screen flex flex-col lg:flex-row">
  {/* Hero: oculto em mobile */}
  <div className="hidden lg:flex lg:w-1/2 ...">{/* Hero content */}</div>

  {/* Form: full width em mobile, mas com max-h sem scroll */}
  <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 lg:py-0 lg:px-8">
    <Card className="w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto lg:overflow-visible">
      {/* Card content: sem scroll externo */}
    </Card>
  </div>
</div>
```

### Pontos-Chave:

1. **Container externo**: `min-h-screen` (tela inteira)
2. **Form container**: `flex items-center justify-center` (centra vertically sem scroll)
3. **Card**: `max-w-md` (largura máxima) + `max-h-[calc(100vh-4rem)]` (altura máxima)
4. **Padding**: `px-4 py-6` em mobile para dar respiro
5. **Hero**: `hidden lg:flex` (oculto em mobile)

---

## Implementação Passo a Passo

### 1. Atualizar força-create-users.mjs

✅ **FEITO** - Credenciais atualizadas

### 2. Refatorar src/app/login/page.tsx

- [ ] Remover hero em <768px
- [ ] Ajustar card height/overflow
- [ ] Testar em mobile

### 3. Refatorar src/app/register/page.tsx

- [ ] Mesma estratégia do login
- [ ] Ocultar carrossel em mobile

### 4. Refatorar src/app/forgot-password/page.tsx

- [ ] Remover aninhamento extra de Card
- [ ] Simplificar layout para 3 steps

---

## CSS Utilities (Tailwind)

```css
/* Em mobile, evitar scroll */
.auth-form-container {
  @apply min-h-screen flex items-center justify-center px-4 py-6;
}

/* Card responsivo */
.auth-card {
  @apply w-full max-w-md max-h-[calc(100vh-2rem)];
  @apply overflow-y-auto lg:overflow-visible;
}

/* Hero só em desktop */
.auth-hero {
  @apply hidden lg:flex lg:w-1/2;
}

/* Form só toma espaço em mobile */
.auth-form-wrapper {
  @apply w-full lg:w-1/2;
}
```

---

## Próximos Comandos

```bash
# 1. Atualizar usuários com novas credenciais
node scripts/force-create-users.mjs

# 2. Limpar build
Remove-Item -Recurse -Force .next

# 3. Subir servidor
npm run dev

# 4. Testar em mobile
# DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
# Testar: iPhone SE (375px), iPhone 14 (390px), iPad (768px)
```

---

## Checklist Final

- [ ] Credenciais funcionam (admin@smeducacional.com / admin123)
- [ ] Login responsivo (sem scroll em mobile)
- [ ] Registro responsivo (sem scroll em mobile)
- [ ] Recuperar senha responsivo (sem scroll em mobile)
- [ ] Hero hidden em <768px
- [ ] Padding adequado em mobile (px-4)
- [ ] Testar em 3 breakpoints: 375px, 390px, 768px+

---

**Status:** Em progresso → Aguardando seu feedback das próximas etapas
