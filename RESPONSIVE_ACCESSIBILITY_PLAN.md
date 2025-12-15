# 📱 Plano de Responsividade e Acessibilidade

## 1. Breakpoints Padrão (Tailwind)

```
xs  : 0px      (mobile small)
sm  : 640px    (mobile)
md  : 768px    (tablet)
lg  : 1024px   (desktop)
xl  : 1280px   (desktop large)
2xl : 1536px   (desktop xlarge)
```

## 2. Melhorias por Componente

### A. Dashboard Admin

**Problema**: Grid muito aperto em mobile
**Solução**:

- Mobile: `grid-cols-1` (vertical stack)
- Tablet: `grid-cols-2` (2 colunas)
- Desktop: `grid-cols-3+` (3+ colunas)
- Aumentar padding de `px-4` para `px-6` em desktop, `px-2` em mobile

### B. Tabs de Configuração

**Problema**: Text pequeno demais em mobile, tabs empilham
**Solução**:

- Mobile: scrollable horizontal, `text-xs`
- Desktop: vertical stack, `text-sm`
- Icons melhor espaçados

### C. Inputs e Forms

**Problema**: Muito apertados, difíceis de tocar
**Solução**:

- Min height: 44px (touch-friendly)
- Padding mobile: `py-3 px-3`
- Font size: `text-base` (prevent zoom em iOS)
- Labels maiores em mobile

### D. Cards

**Problema**: Padding insuficiente em mobile
**Solução**:

- Mobile: `p-3` → `p-4`
- Desktop: `p-6` → `p-8`
- Gap entre cards: `gap-2` mobile → `gap-4` desktop

### E. Buttons

**Problema**: Muito pequenos para tocar
**Solução**:

- Min size: 44x44px
- Mobile padding: `py-3 px-4`
- Desktop padding: `py-2 px-4`

### F. Tipografia

**Problema**: Text muito pequena em mobile
**Solução**:

- H1: `text-2xl` mobile → `text-4xl` desktop
- H2: `text-xl` mobile → `text-3xl` desktop
- Body: `text-sm` mobile → `text-base` desktop
- Labels: `text-xs` mobile → `text-sm` desktop

### G. Tabelas

**Problema**: Overflow horizontal, difíceis de ler
**Solução**:

- Mobile: cards ao invés de tabela
- Tablet+: tabela com scroll horizontal
- Usar `text-xs` em mobile, `text-sm` em desktop

### H. Navigation Bar

**Problema**: Menu colapsado em mobile
**Solução**:

- Mobile: hamburger menu, drawer de lado
- Tablet: navbar completa
- Sticky position em mobile para facilitar acesso

## 3. Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande ou componentes)
- [ ] Todos inputs com labels visuais/aria-label
- [ ] Navegação por teclado (tab order)
- [ ] Focus visible com outline
- [ ] Aria-labels para icons
- [ ] Aria-describedby para erros

## 4. Performance Mobile

- [ ] Lazy loading de images
- [ ] Code splitting de routes
- [ ] Compressão de assets (images)
- [ ] Minimize CSS/JS enviado
- [ ] Cacheing agressivo de assets estáticos
- [ ] Service Worker para offline
- [ ] Preload de fontes críticas

## 5. Rotas a Auditar

### Públicas

- [ ] `/` - home
- [ ] `/courses` - catálogo
- [ ] `/login` - autenticação
- [ ] `/register` - cadastro

### Admin

- [ ] `/admin/dashboard` - dashboard
- [ ] `/admin/settings` - configurações
- [ ] `/admin/users` - lista de usuários
- [ ] `/admin/courses` - gerenciamento de cursos

### Professor

- [ ] `/teacher/dashboard` - dashboard
- [ ] `/teacher/theme` - personalização
- [ ] `/teacher/landing` - builder de landing
- [ ] `/teacher/courses` - cursos

### Aluno

- [ ] `/student/dashboard` - dashboard
- [ ] `/student/courses` - meus cursos
- [ ] `/student/course/[id]` - curso detalhado

## 6. Implementação por Fase

**Fase 1**: Admin settings + Forms
**Fase 2**: Dashboards (admin, teacher, student)
**Fase 3**: Público + authentication
**Fase 4**: Acessibilidade em todas
**Fase 5**: Performance mobile
