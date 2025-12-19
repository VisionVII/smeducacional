# 🎨 Sistema Hierárquico de Temas VisionVII

## 📋 Arquitetura de Prioridades

### 1️⃣ **Rotas Públicas** (Não Autenticadas)

**Tema Aplicado:** `ADMIN` (SystemConfig)

- `/` - Home
- `/about` - Sobre
- `/courses` - Catálogo de cursos
- `/courses/[slug]` - Detalhes do curso
- `/login` - Login
- `/register` - Registro
- `/forgot-password` - Recuperação de senha

**Regra:** Tema do admin é **imutável** para usuários. Define identidade visual da plataforma.

---

### 2️⃣ **Rotas Admin** (ADMIN Role)

**Tema Aplicado:** `ADMIN` (SystemConfig)

- `/admin/*` - Todas as rotas administrativas

**Regra:** Admin usa seu próprio tema definido em SystemConfig. Não pode ser alterado por outros usuários.

---

### 3️⃣ **Rotas Teacher** (TEACHER Role)

**Tema Aplicado:** `UserTheme` do professor (fallback: ADMIN)

- `/teacher/*` - Todas as rotas do professor

**Regra:** Professor pode personalizar **apenas sua área**. Não afeta rotas públicas ou admin.

---

### 4️⃣ **Rotas Student** (STUDENT Role)

**Tema Aplicado:** `UserTheme` do aluno (fallback: ADMIN)

- `/student/*` - Todas as rotas do aluno

**Regra:** Aluno pode personalizar **apenas sua área**. Não afeta rotas públicas ou admin.

---

## 🔄 Fluxo de Resolução de Tema

```typescript
function resolveTheme(route: string, userId?: string, userRole?: Role) {
  // 1. Rotas públicas → sempre ADMIN theme
  if (isPublicRoute(route)) {
    return getAdminTheme();
  }

  // 2. Rotas admin → sempre ADMIN theme
  if (route.startsWith('/admin')) {
    return getAdminTheme();
  }

  // 3. Rotas autenticadas (teacher/student) → UserTheme com fallback
  if (userId && (userRole === 'TEACHER' || userRole === 'STUDENT')) {
    const userTheme = getUserTheme(userId);
    if (userTheme) return userTheme;
    return getAdminTheme(); // Fallback
  }

  // 4. Default → ADMIN theme
  return getAdminTheme();
}
```

---

## 🎯 Implementação Técnica

### **ThemeScript SSR** (src/components/theme/theme-script.tsx)

```tsx
export function ThemeScript({ userId, userRole, pathname }: Props) {
  // Determina qual tema aplicar baseado na rota
  const theme = await resolveTheme(pathname, userId, userRole);

  // Injeta CSS variables no <head>
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const root = document.documentElement;
            ${generateCssVariables(theme)}
          })();
        `,
      }}
    />
  );
}
```

### **Navbar Branding** (src/components/navbar.tsx)

```tsx
// Sempre usa SystemConfig para logo/cores
const branding = await getSystemBranding();

// Aplica background do admin
<header style={{ backgroundImage: branding.navbarBgUrl }} />;
```

---

## 🛡️ Regras de Segurança

1. **Immutabilidade Admin:**

   - Apenas ADMIN pode alterar SystemConfig
   - Teacher/Student não têm acesso a `/admin/settings/branding`

2. **Isolamento de Temas:**

   - UserTheme de teacher A não afeta teacher B
   - Cada usuário tem seu próprio registro na tabela `UserTheme`

3. **Fallback Sempre Admin:**
   - Se UserTheme não existe → usa admin
   - Se erro ao buscar tema → usa admin
   - Garante consistência visual

---

## 📦 Modelos do Prisma

### **SystemConfig** (Tema Global/Admin)

```prisma
model SystemConfig {
  id            String  @id @default(cuid())
  logoUrl       String?
  faviconUrl    String?
  navbarBgUrl   String? // Background navbar (admin)
  loginBgUrl    String?
  primaryColor  String? // Cor primária (admin)
  secondaryColor String?
  themePresetId String  @default("academic-blue") // Tema ativo admin
  // ...
}
```

### **UserTheme** (Temas Individuais)

```prisma
model UserTheme {
  id        String  @id @default(cuid())
  userId    String  @unique
  presetId  String  @default("academic-blue")
  user      User    @relation(...)
  // cardStyle, animations, etc.
}
```

---

## 🎨 Design Consistency

### **Pattern Obrigatório em TODAS as Páginas:**

```tsx
return (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1800px]">
      {/* Cards com gradientes */}
      <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]" />
        <CardContent className="relative z-10">{/* Conteúdo */}</CardContent>
      </Card>
    </div>
  </div>
);
```

### **KPI Cards Pattern:**

```tsx
<Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group">
  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
  <CardHeader className="relative z-10">
    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
      <Icon className="h-4 w-4 text-white" />
    </div>
  </CardHeader>
</Card>
```

---

## ✅ Checklist de Implementação

### Fase 1: Hierarquia de Temas

- [ ] Atualizar `getUserTheme()` para fallback admin
- [ ] Criar `resolveThemeForRoute()` utility
- [ ] Atualizar ThemeScript com lógica hierárquica
- [ ] Garantir rotas públicas usam admin

### Fase 2: Refatoração Admin Settings

- [ ] Criar `/admin/settings/theme` com ThemeSelector
- [ ] Mover branding para `/admin/settings/branding`
- [ ] Aplicar design premium (gradientes, cards)
- [ ] Remover tab-based UI antiga

### Fase 3: Consistência Visual

- [ ] Atualizar todas rotas admin com gradientes
- [ ] Atualizar todas rotas teacher com gradientes
- [ ] Atualizar todas rotas student com gradientes
- [ ] Atualizar rotas públicas com gradientes

### Fase 4: Testes

- [ ] Testar tema admin em rotas públicas
- [ ] Testar isolamento teacher/student
- [ ] Testar fallback quando UserTheme não existe
- [ ] Testar navegação entre áreas (tema muda corretamente)

---

**Desenvolvido com excelência pela VisionVII**
