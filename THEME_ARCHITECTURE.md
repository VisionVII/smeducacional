# 🏗️ Arquitetura de Tema - Sistema Independente

> **⚠️ DOCUMENTO LEGADO**: Esta arquitetura de "herança de tema" foi substituída pela arquitetura **independente por usuário**.  
> Consulte [`TEMA_INDEPENDENTE_POR_USUARIO.md`](TEMA_INDEPENDENTE_POR_USUARIO.md) para a documentação atualizada.

---

## ✅ Nova Arquitetura (Dezembro 2025)

Cada usuário agora possui **seu próprio tema independente**:

- **API Universal**: `/api/user/theme` (GET/PUT/DELETE)
- **Sem herança**: Aluno não herda tema do professor
- **Performance**: 1 fetch direto (antes eram 3 fetches em cadeia)
- **Consistência**: Tema aplica em todas as rotas globalmente
- **Cache**: `user-theme-cache` (5 minutos) para todos os roles

### Fluxo Simplificado Atual

```
Usuário (STUDENT/TEACHER/ADMIN)
  → Login com NextAuth
  → Provider monta (Student/Teacher/PublicThemeProvider)
  → Fetch GET /api/user/theme
  → Retorna tema próprio do usuário OU null (usa DEFAULT_THEME)
  → Aplica CSS vars no document.documentElement
  → MutationObserver reage apenas a mudanças dark/light
```

---

## ❌ Arquitetura Antiga (LEGADO - NÃO USAR)

### Fluxo Visual Antigo (Herança)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT LOGIN FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. Aluno faz LOGIN
   ↓
2. Sessão criada com role=STUDENT
   ↓
3. Aluno acessa /student/dashboard
   ↓
4. StudentLayout renderizado
   ├─ Navbar
   ├─ StudentThemeProvider ← AQUI!
   │  └─ NextThemesProvider (storageKey="student-theme-mode")
   │
   └─ MainContent
      └─ Outras páginas do aluno

```

---

## StudentThemeProvider - Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│         StudentThemeProvider Mount                   │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
    ┌──────────────────────┐
    │  loadTheme()         │
    │  {async function}    │
    └──────────┬───────────┘
               │
               ↓ Fetch 1
    ┌──────────────────────────────────┐
    │ GET /api/student/enrollments     │
    │ → Returns: [{courseId, ...}, ...] │
    └──────────┬───────────────────────┘
               │
               ├─ No enrollments?
               │  └─→ Use DEFAULT_THEME (fallback)
               │
               ↓ Fetch 2
    ┌──────────────────────────────────┐
    │ GET /api/courses/{courseId}      │
    │ → Returns: {instructorId, ...}   │
    └──────────┬───────────────────────┘
               │
               ↓ Fetch 3
    ┌──────────────────────────────────┐
    │ GET /api/teacher/{instructorId}/theme │
    │ → Returns: {palette, layout, ...} │
    └──────────┬───────────────────────┘
               │
               ↓
    ┌──────────────────────────────────┐
    │  setTheme(teacherTheme)          │
    │  Update React state              │
    └──────────┬───────────────────────┘
               │
               ↓
    ┌──────────────────────────────────┐
    │  applyTheme() [useEffect]        │
    │  Set CSS custom properties       │
    │  on document.documentElement     │
    └──────────┬───────────────────────┘
               │
               ↓
    ┌──────────────────────────────────┐
    │  MutationObserver watches for     │
    │  dark/light toggle               │
    │  Reapplies theme on change       │
    └──────────────────────────────────┘

```

---

## Storage Keys Architecture

```
LocalStorage Layout
═══════════════════════════════════════════════════════════

PUBLIC PAGES (/, /courses, /about, /login)
├─ app-theme-mode: "light" | "dark" | "system"
└─ Theme: Default system theme

TEACHER DASHBOARD (/teacher/*)
├─ teacher-theme-mode: "light" | "dark" | "system"
├─ Loaded from: /api/teacher/theme
└─ Theme: Custom teacher palette + dark/light

STUDENT DASHBOARD (/student/*)
├─ student-theme-mode: "light" | "dark" | "system"
├─ Loaded from: /api/teacher/{id}/theme (via enrollment)
└─ Theme: Teacher palette + student's dark/light

═══════════════════════════════════════════════════════════
Resultado: Cada role tem INDEPENDÊNCIA de dark/light!
```

---

## CSS Variables Application

```
┌────────────────────────────────────────┐
│  Document Element                      │
│  (document.documentElement)            │
├────────────────────────────────────────┤
│                                        │
│  --primary: "221.2 83.2% 53.3%"      │ ← Professor's color
│  --secondary: "210 40% 96.1%"         │
│  --accent: "210 40% 96.1%"            │
│  --background: HSL(light/dark)        │
│  --foreground: HSL(light/dark)        │
│  --card: HSL(light/dark)              │
│  --muted: HSL(light/dark)             │
│                                        │
│  --radius: "0.5rem"                   │
│  --shadow-intensity: "medium"         │
│  --spacing: "comfortable"              │
│                                        │
│  --animation-duration: "300ms"        │
│  --animation-easing: "ease-in-out"    │
│                                        │
└────────────────────────────────────────┘
         ↓
  Aplicado para TODOS os descendentes
  via Tailwind CSS (@apply) e CSS inheritance
         ↓
  ┌─────────────────────┐
  │ UI Components       │
  │ (Card, Button, etc) │
  └─────────────────────┘
         │
         ↓
  Usam var(--primary), var(--secondary), etc.
  Tema do professor automáticamente aplicado!
```

---

## Component Hierarchy

```
html (dark class added by next-themes)
│
└─ body
   │
   └─ RootLayout
      │
      ├─ ThemeProvider (storageKey="app-theme-mode")
      │
      └─ AuthProvider
         │
         └─ QueryProvider
            │
            └─ Main Router
               │
               ├─ PUBLIC PAGES
               │  └─ Use RootLayout theme
               │
               ├─ StudentLayout
               │  │
               │  ├─ StudentThemeProvider ← ✨ NEW
               │  │  └─ NextThemesProvider (storageKey="student-theme-mode")
               │  │
               │  ├─ Navbar (Logo → /student/dashboard)
               │  │
               │  ├─ StudentDashboard
               │  ├─ StudentCourses
               │  ├─ StudentProfile
               │  └─ ... other student routes
               │
               ├─ TeacherLayout
               │  │
               │  ├─ TeacherThemeProvider (storageKey="teacher-theme-mode")
               │  │
               │  ├─ Navbar (Logo → /teacher/dashboard)
               │  │
               │  ├─ TeacherDashboard
               │  ├─ TeacherTheme ← customize colors here
               │  └─ ... other teacher routes
               │
               └─ AdminLayout
                  └─ ... admin routes
```

---

## Data Flow: Teacher Customization → Student View

```
TEACHER CUSTOMIZATION
═══════════════════════════════════════════════════════════

1. Professor acessa /teacher/theme
   ↓
2. Modifica cor primária (ex: azul → verde)
   ↓
3. PUT /api/teacher/theme {palette: {...}}
   ↓
4. Salvo em database (teacherTheme table)
   ↓
5. localStorage atualizado (teacher-theme-mode)
   ↓
6. CSS variables reapplicadas

═══════════════════════════════════════════════════════════

STUDENT VIEW
═══════════════════════════════════════════════════════════

7. Aluno matriculado no curso do professor
   ↓
8. Acessa /student/courses
   ↓
9. StudentThemeProvider monta
   ↓
10. Fetch GET /api/teacher/{teacherId}/theme
    ↓
11. Recebe {palette: {primary: "verde", ...}}
    ↓
12. setTheme() → React state atualizado
    ↓
13. applyTheme() → CSS vars aplicadas
    ↓
14. Aluno vê VERDE (cor do professor)
    ↓
15. Aluno pode alternar dark/light
    └─→ VERDE permanece (via student-theme-mode)

═══════════════════════════════════════════════════════════
Professor em DARK, Aluno em LIGHT = MESMO VERDE!
```

---

## Error Handling Tree

```
StudentThemeProvider
│
├─ loadTheme() async
│  │
│  ├─ Fetch /api/student/enrollments FAIL
│  │  └─→ setTheme(DEFAULT_THEME)
│  │
│  ├─ Fetch /api/courses/{id} FAIL
│  │  └─→ setTheme(DEFAULT_THEME)
│  │
│  ├─ Fetch /api/teacher/{id}/theme FAIL
│  │  └─→ setTheme(DEFAULT_THEME)
│  │
│  └─ No enrollments
│     └─→ setTheme(DEFAULT_THEME)
│
├─ applyTheme() error
│  └─→ Check console logs
│
└─ MutationObserver error
   └─→ Dark/light toggle may not work
       (but colors still applied)

Fallback: DEFAULT_THEME always available
```

---

## Browser Storage Timeline

```
Session Start
──────────────

localStorage:
├─ app-theme-mode: "light"        ← Default on first load
├─ student-theme-mode: undefined   ← Will be set on first toggle
└─ teacher-theme-mode: undefined   ← Will be set on first toggle

───────────────────────────────────

Student accesses /student/courses
────────────────────────────────

Fetch chain completes:
├─ GET /api/student/enrollments → OK
├─ GET /api/courses/{id} → OK
└─ GET /api/teacher/{id}/theme → OK

React state updated:
└─ theme = {palette: {...}, layout: {...}}

CSS applied:
└─ document.documentElement.style.setProperty(...)

localStorage UNCHANGED (no dark/light toggle yet)

───────────────────────────────────

Student toggles DARK mode (button click)
──────────────────────────────────────

next-themes captures toggle:
├─ Updates document.documentElement.className
├─ Fires MutationObserver
└─ Saves to localStorage

localStorage UPDATED:
└─ student-theme-mode: "dark"

applyTheme() re-runs:
├─ isDark = true
└─ Adjusts background/foreground lightness for dark

Teacher unaffected:
└─ teacher-theme-mode: still undefined (never toggled)

Result:
└─ Student: dark mode, green colors
   Teacher: light mode, green colors
```

---

## Performance Metrics

```
Page Load Timeline
══════════════════════════════════════════════════════════

0ms   Page starts rendering
      ├─ HTML received
      ├─ JavaScript parsing
      └─ React hydration

~100ms StudentLayout mounts
       ├─ StudentThemeProvider created
       ├─ NextThemesProvider setup
       └─ loadTheme() async started

~200ms Page interactive (before theme loads)
       ├─ Default theme applied (from globals.css)
       └─ User can interact

~500ms First fetch completes (/api/student/enrollments)
       └─ Progressing through fetch chain

~1000ms Theme fetches complete
        ├─ GET /api/teacher/{id}/theme → 300-500ms
        └─ setTheme() triggers React update

~1200ms applyTheme() executes
        ├─ CSS variables updated
        ├─ DOM paints with theme colors
        └─ Transition smoothly (300ms transition)

~1500ms Final render complete
        └─ Theme fully applied, colors visible

══════════════════════════════════════════════════════════
Total time to themed UI: ~1.5 seconds (first load)
Subsequent loads: ~500ms (if cached)
```

---

## Module Dependencies

```
student-theme-provider.tsx
├─ React (useState, useContext, useEffect)
├─ next-themes (ThemeProvider)
├─ @/lib/theme-presets (DEFAULT_PRESET)
└─ Fetches:
   ├─ /api/student/enrollments
   ├─ /api/courses/{courseId}
   └─ /api/teacher/{teacherId}/theme

student/layout.tsx
├─ next/navigation
├─ @/lib/auth
├─ @/components/student-theme-provider ← Import
├─ @/components/navbar
├─ @/components/footer
└─ Uses StudentThemeProvider

navbar.tsx
├─ next/link
├─ @/lib/utils (cn)
├─ next-auth/react (signOut)
└─ Imports getHomeHref() function
```

---

## Deployment Checklist

```
PRE-DEPLOYMENT
═══════════════════════════════════════════════════════════

Code Quality:
□ All files linted (npm run lint)
□ TypeScript checks pass (npm run build)
□ No console errors in dev
□ No console warnings (except third-party)

Testing:
□ Manual test: Theme loads on /student/courses
□ Manual test: Logo doesn't reset theme
□ Manual test: Dark/light toggle works independently
□ Manual test: Fallback theme when no courses

Performance:
□ Build time < 1 minute
□ Pages load < 2 seconds
□ No memory leaks in theme provider

Security:
□ Auth checks on API endpoints
□ Zod validation on inputs
□ No sensitive data in localStorage

DEPLOYMENT
═══════════════════════════════════════════════════════════

1. npm run build
2. Verify build successful (102 routes)
3. npm run start (test production build locally)
4. Deploy to Vercel/server
5. Verify /student/courses loads theme
6. Monitor error logs for first week

POST-DEPLOYMENT
═══════════════════════════════════════════════════════════

□ Test on staging environment
□ Monitor Sentry for errors
□ Check performance metrics
□ Verify student reports success
```

---

## Success Indicators

```
✅ Theme loads within 2 seconds
✅ No console errors in student pages
✅ Dark/light toggle independent per role
✅ Logo click stays in student context
✅ Fallback theme displays if no course
✅ CSS variables correctly applied
✅ Smooth transitions on mode change
✅ Performance acceptable (LCP < 2.5s)
```

Desenvolvido com excelência pela **VisionVII** 🚀
