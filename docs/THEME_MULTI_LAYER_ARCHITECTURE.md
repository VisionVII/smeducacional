# 🎨 Sistema de Temas Multi-Camada - Arquitetura Final

## 📋 Visão Geral

O sistema VisionVII agora suporta **3 camadas independentes de temas**:

1. **Tema da Dashboard** (STUDENT/TEACHER) - Cores da área privada
2. **Tema da Landing Page** (TEACHER) - Cores da página de vendas do professor
3. **Tema Público** (ADMIN) - Cores das páginas institucionais (/home, /about, /courses, etc)

## 🏗️ Arquitetura de Providers

### 1. StudentThemeProvider

**Arquivo**: `src/components/student-theme-provider.tsx`  
**Escopo**: Área `/student/*`  
**Fonte**: `/api/user/theme` (tema próprio do aluno)  
**Características**:

- Cache de 5 minutos em sessionStorage
- Transições desabilitadas (aplicação instantânea)
- Suporta dark/light mode com MutationObserver protegido

### 2. TeacherThemeProvider

**Arquivo**: `src/components/teacher-theme-provider.tsx`  
**Escopo**: Área `/teacher/*`  
**Fonte**: `/api/user/theme` (tema próprio do professor)  
**Características**:

- Sem cache (sempre fresh do banco)
- Transições desabilitadas (aplicação instantânea)
- Suporta customização completa (palette, layout, animations)

### 3. PublicThemeProvider

**Arquivo**: `src/components/public-theme-provider.tsx`  
**Escopo**: Páginas públicas (/, /about, /courses, /contact, etc)  
**Fontes**:

- `/api/teacher/[teacherId]/landing/theme` - Landing do professor
- `/api/public/site` - Tema público definido pelo admin
- `staticTheme` prop - Override manual
  **Características**:
- Carrega tema do admin por padrão
- Aceita teacherId para landing pages
- Aceita staticTheme para preview

### 4. NavbarThemeProvider ⚡ (NOVO)

**Arquivo**: `src/components/navbar-theme-provider.tsx`  
**Escopo**: APENAS o navbar em páginas públicas quando usuário está logado  
**Fonte**: `/api/user/theme` (tema do usuário logado)  
**Características**:

- Aplica variáveis CSS com prefixo `--navbar-*`
- Não interfere nas variáveis globais da página
- Usa atributo `data-navbar-themed="true"` no `<html>`
- CSS: `html[data-navbar-themed] .navbar-themed { ... }`

## 🔧 Endpoints API

### Tema Próprio (STUDENT/TEACHER/ADMIN)

```
GET    /api/user/theme           # Retorna tema customizado do usuário
PUT    /api/user/theme           # Salva tema customizado do usuário
DELETE /api/user/theme           # Remove tema customizado (volta ao padrão)
```

### Tema da Landing (TEACHER)

```
GET    /api/teacher/landing/theme              # Retorna tema da landing (autenticado)
PUT    /api/teacher/landing/theme              # Salva tema da landing (autenticado)
DELETE /api/teacher/landing/theme              # Remove tema da landing
GET    /api/teacher/[teacherId]/landing/theme  # Público - preview do tema da landing
```

### Tema Público (ADMIN)

```
GET    /api/admin/public-site    # Retorna tema+conteúdo público (admin only)
PUT    /api/admin/public-site    # Salva tema+conteúdo público (admin only)
GET    /api/public/site          # Público - tema das páginas institucionais
```

## 🎯 Fluxo de Cores por Contexto

### Usuário Não Logado em Página Pública

```
Página: /                    → PublicThemeProvider → Tema do admin
Navbar: PublicNavbar         → Cores padrão do sistema
```

### Aluno Logado em Página Pública

```
Página: /courses             → PublicThemeProvider → Tema do admin
Navbar: AdaptiveNavbar       → NavbarThemeProvider → Cores do aluno
        └─ Navbar (themed)
```

### Professor Logado em Página Pública

```
Página: /                    → PublicThemeProvider → Tema do admin
Navbar: AdaptiveNavbar       → NavbarThemeProvider → Cores do professor
        └─ Navbar (themed)
```

### Aluno na Dashboard

```
Página: /student/dashboard   → StudentThemeProvider → Cores do aluno
Navbar: StudentLayout        → Sidebar com cores do aluno
```

### Professor na Dashboard

```
Página: /teacher/dashboard   → TeacherThemeProvider → Cores do professor
Navbar: TeacherLayout        → Sidebar com cores do professor
```

### Landing Page do Professor (Preview)

```
Página: /landing-preview     → PublicThemeProvider (staticTheme)
                             → Tema específico da landing (independente da dashboard)
Navbar: Não aparece          → Landing full-screen
```

## 🗄️ Banco de Dados (Prisma Schema)

```prisma
model User {
  // Tema da dashboard (STUDENT/TEACHER/ADMIN)
  teacherTheme  TeacherTheme?

  // Tema da landing page (TEACHER only)
  landingTheme  Json?

  // Config da landing page (textos, imagens, etc)
  landingConfig Json?
}

model PublicSiteConfig {
  slug      String   @unique
  theme     Json?    // Tema público definido pelo admin
  content   Json?    // Conteúdo público (banners, SEO, métricas)
}

model TeacherTheme {
  userId    String   @unique
  palette   Json
  layout    Json
  animations Json?
}
```

## 🎨 CSS Customizado para Navbar

**Arquivo**: `src/app/globals.css`

```css
/* Quando usuário está logado, navbar usa suas cores */
html[data-navbar-themed] .navbar-themed {
  background: hsl(var(--navbar-background) / 0.95) !important;
  border-color: hsl(var(--navbar-border)) !important;
}

html[data-navbar-themed] .navbar-link-active {
  background: hsl(var(--navbar-primary)) !important;
  color: hsl(var(--navbar-primary-foreground)) !important;
}
```

**Variáveis aplicadas**:

- `--navbar-background`
- `--navbar-foreground`
- `--navbar-primary`
- `--navbar-primary-foreground`
- `--navbar-accent`
- `--navbar-accent-foreground`
- `--navbar-muted`
- `--navbar-muted-foreground`
- etc.

## 📝 Persistência de Temas

### ✅ Garantida Automaticamente

1. **Tema da Dashboard**: Salvo em `teacherTheme` table (userId único)
2. **Tema da Landing**: Salvo em `User.landingTheme` JSON field
3. **Tema Público**: Salvo em `PublicSiteConfig` table (slug único)

### Cache Strategy

- **Student**: sessionStorage (5 min) + DB
- **Teacher**: Sem cache (sempre fresh)
- **Public**: Sem cache (sempre fresh do admin)
- **Navbar**: Carrega a cada mount (session check)

## 🚀 Performance

### Otimizações Aplicadas

1. **Transições Desabilitadas**: `root.style.transition = 'none'` durante aplicação
2. **RequestAnimationFrame**: Restaura transições após repaint
3. **MutationObserver Protegido**: Track `prevIsDark` para evitar loops
4. **Cache Inteligente**: Student usa cache de 5 min, outros sempre fresh

### Loading States

- **StudentThemeProvider**: Tela de loading com spinner
- **TeacherThemeProvider**: Sem loading (aplica padrão instantaneamente)
- **PublicThemeProvider**: Sem loading (aplica padrão instantaneamente)
- **NavbarThemeProvider**: Transparente (não bloqueia renderização)

## 🎯 Casos de Uso Completos

### Caso 1: Professor Personaliza Landing com Cores Diferentes da Dashboard

```
1. Professor acessa /teacher/theme
2. Escolhe tema "Oceano Profundo" (azul escuro)
3. Dashboard fica azul escuro
4. Professor acessa "Configurar Landing"
5. Escolhe tema "Sunset Warmth" (laranja/rosa)
6. Landing preview mostra laranja/rosa
7. Landing pública usa laranja/rosa
8. Dashboard continua azul escuro
```

### Caso 2: Admin Define Tema Público Institucional

```
1. Admin acessa /admin/public-site
2. Escolhe tema "Corporate Blue" (azul corporativo)
3. Salva configuração
4. Todas páginas públicas (/, /about, /courses) ficam azul corporativo
5. Aluno logado visita /
   - Página: azul corporativo (admin)
   - Navbar: verde vibrante (cores do aluno)
6. Professor logado visita /
   - Página: azul corporativo (admin)
   - Navbar: roxo elegante (cores do professor)
```

### Caso 3: Aluno Navega Entre Áreas

```
1. Aluno logado visita / (home pública)
   - Página: Tema público do admin
   - Navbar: Cores customizadas do aluno
2. Aluno clica "Meus Cursos" (/student/courses)
   - Página: Tema customizado do aluno
   - Sidebar: Cores customizadas do aluno
3. Aluno clica "Catálogo" (/courses)
   - Página: Tema customizado do aluno (fix aplicado)
   - Navbar: Cores customizadas do aluno
```

## 🔒 Segurança

### Autenticação de Endpoints

- `/api/user/theme`: Requer session (qualquer role)
- `/api/teacher/landing/theme`: Requer session (TEACHER only)
- `/api/admin/public-site`: Requer session (ADMIN only)
- `/api/public/site`: Público (sem auth)
- `/api/teacher/[teacherId]/landing/theme`: Público (sem auth)

### Validação Zod

Todos os endpoints de tema usam validação Zod:

```typescript
const paletteSchema = z.object({
  background: z.string(),
  primary: z.string(),
  // ...
});
```

## 🛠️ Próximos Passos

### Admin UI (Pendente)

1. Criar `/admin/public-site` page
2. Componentes:
   - Theme picker (presets)
   - Custom color editor
   - Banner uploader
   - SEO fields (title, description, keywords)
   - Métricas AEO/SEO
   - Preview mode

### Teacher UI (Pendente)

1. Adicionar seção "Tema da Landing" em `/teacher/theme`
2. Componentes:
   - Toggle "Usar tema da dashboard" vs "Tema exclusivo"
   - Theme picker para landing
   - Preview da landing com tema selecionado
   - Link para `/landing-preview?teacherId={id}`

### Database Migration (Necessário)

```bash
npm run db:generate  # Gera Prisma Client com novos campos
npm run db:migrate   # Cria migration para landingTheme e PublicSiteConfig
```

## 📚 Arquivos Modificados

### Novos Arquivos

- `src/components/navbar-theme-provider.tsx`
- `src/app/api/teacher/landing/theme/route.ts`
- `src/app/api/teacher/[teacherId]/landing/theme/route.ts`
- `src/app/api/admin/public-site/route.ts`
- `src/app/api/public/site/route.ts`

### Arquivos Atualizados

- `src/components/adaptive-navbar.tsx` (wrap Navbar com NavbarThemeProvider)
- `src/components/navbar.tsx` (adiciona classe navbar-themed)
- `src/components/public-theme-provider.tsx` (suporta admin theme + static override)
- `src/app/landing-preview/page.tsx` (passa staticTheme para provider)
- `src/app/api/teacher/landing/route.ts` (retorna theme junto com config)
- `src/app/globals.css` (estilos para navbar-themed)
- `prisma/schema.prisma` (campos landingTheme e PublicSiteConfig)

---

Desenvolvido com excelência pela **VisionVII** — Transformação digital através de arquitetura de software de ponta.
