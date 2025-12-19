# 🚀 PLANO DE EXECUÇÃO - REFATORAÇÃO COMPLETA DE TEMAS

**Status**: Iniciando demolição  
**Estimativa Total**: 9-12 horas  
**Abordagem**: Incremental com testes em cada fase

---

## ✅ FASE 1: LIMPEZA (CONCLUÍDO PARCIALMENTE)

### 1.1 Providers Deletados ✅

- [x] admin-theme-provider.tsx
- [x] teacher-theme-provider.tsx
- [x] student-theme-provider.tsx
- [x] theme-sync-provider.tsx
- [x] public-theme-provider.tsx
- [x] public-theme-boundary.tsx
- [x] navbar-theme-provider.tsx
- [x] theme-test-component.tsx
- [x] admin/settings/public-theme-editor.tsx
- [x] admin/settings/theme-preview.tsx
- [x] admin/theme/page.tsx

**Mantido**: `theme-provider.tsx` (next-themes - dark/light mode)

### 1.2 Globals.CSS - ⏳ PENDENTE

- [ ] Parar dev server (Ctrl+C)
- [ ] Deletar src/app/globals.css
- [ ] Criar novo globals.css limpo:
  - Fonte Inter (Google Fonts)
  - Cores preto/branco puras
  - next-themes (dark mode)
  - Sem custom properties complexas

### 1.3 Banco de Dados - ⏳ PENDENTE

```sql
-- Remover tabelas antigas
DROP TABLE IF EXISTS admin_themes CASCADE;
DROP TABLE IF EXISTS teacher_themes CASCADE;

-- Limpar publicTheme do SystemConfig
UPDATE system_configs SET "publicTheme" = NULL WHERE key = 'default';
```

---

## 📊 FASE 2: NOVA FUNDAÇÃO (2-3h)

### 2.1 Schema Prisma - UserTheme Unificado

```prisma
model UserTheme {
  id        String   @id @default(cuid())
  userId    String   @unique
  role      Role     // ADMIN, TEACHER, STUDENT

  // ID do preset selecionado (1-6)
  presetId  String   @default("academic-blue")

  // Card Style Configuration
  cardStyle CardStyle @default(FLAT)
  cardShadow ShadowIntensity @default(NONE)
  cardBorder Boolean @default(true)
  card3D Boolean @default(false)

  // Layout
  spacing Spacing @default(COMFORTABLE)
  borderRadius String @default("0.5rem")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([role])
  @@map("user_themes")
}

enum CardStyle {
  FLAT
  ELEVATED
  BORDERED
  GLASS
}

enum ShadowIntensity {
  NONE
  LIGHT
  MEDIUM
  STRONG
}

enum Spacing {
  COMPACT
  COMFORTABLE
  SPACIOUS
}
```

### 2.2 Theme Presets (`/lib/themes/presets.ts`)

```typescript
export const THEME_PRESETS = {
  'academic-blue': {
    id: 'academic-blue',
    name: 'Academic Blue',
    colors: {
      light: {
        primary: '221 83% 53%', // #2563EB
        primaryHover: '221 83% 45%', // #1E40AF
        secondary: '221 83% 90%',
        accent: '142 76% 36%',
        background: '0 0% 100%',
        foreground: '0 0% 10%',
      },
      dark: {
        primary: '217 92% 60%',
        primaryHover: '217 92% 70%',
        secondary: '217 33% 18%',
        accent: '142 76% 45%',
        background: '224 71% 4%',
        foreground: '213 31% 91%',
      },
    },
  },
  // ... mais 5 temas
};
```

### 2.3 Middleware (`middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserTheme } from '@/lib/themes/get-user-theme';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (token) {
    const theme = await getUserTheme(token.id, token.role);

    // Set cookie with theme preset
    const response = NextResponse.next();
    response.cookies.set('user-theme', theme.presetId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
```

### 2.4 Theme Script Inline (`/components/theme-script.tsx`)

```typescript
export function ThemeScript({ theme }: { theme: string }) {
  const preset = THEME_PRESETS[theme];

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const root = document.documentElement;
            const isDark = root.classList.contains('dark');
            const colors = ${JSON.stringify(preset.colors)};
            const palette = isDark ? colors.dark : colors.light;
            
            Object.entries(palette).forEach(([key, value]) => {
              root.style.setProperty('--' + key, value);
            });
          })();
        `,
      }}
    />
  );
}
```

---

## 🎨 FASE 3: IMPLEMENTAÇÃO TEMAS (2-3h)

### 3.1 6 Temas Profissionais

| ID  | Nome          | Primary | Secondary | Uso                 |
| --- | ------------- | ------- | --------- | ------------------- |
| 1   | academic-blue | #2563EB | #3B82F6   | Dashboard padrão    |
| 2   | forest-green  | #059669 | #10B981   | STEM, ciências      |
| 3   | sunset-orange | #EA580C | #F97316   | Artes, criatividade |
| 4   | royal-purple  | #7C3AED | #A78BFA   | Premium courses     |
| 5   | ocean-teal    | #0891B2 | #06B6D4   | Leitura intensiva   |
| 6   | crimson-red   | #DC2626 | #EF4444   | Urgência, deadlines |

### 3.2 API Routes

```
/app/api/user/theme/route.ts
  GET - Retorna tema do usuário logado
  PUT - Atualiza tema (preset + card config)
  DELETE - Reset para academic-blue

/app/api/user/theme/preview/route.ts
  POST - Preview temporário sem salvar
```

### 3.3 UI - Página de Seleção

```
/app/[role]/settings/theme/page.tsx
  - Grid com 6 cards de preview
  - Cada card mostra cores do tema
  - Config avançada de cards (collapse)
  - Botão "Aplicar" - sem reload!
  - Preview em tempo real
```

---

## 🔧 FASE 4: CARDS AVANÇADOS (2h)

### 4.1 Card Styles

```typescript
// Flat - sem sombra, borda sutil
.card-flat {
  box-shadow: none;
  border: 1px solid hsl(var(--border));
}

// Elevated - sombra suave
.card-elevated {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border: none;
}

// Bordered - borda grossa colorida
.card-bordered {
  border: 2px solid hsl(var(--primary));
  box-shadow: none;
}

// Glass - blur backdrop
.card-glass {
  background: hsl(var(--card) / 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.5);
}
```

### 4.2 Card 3D Effect

```css
.card-3d {
  transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
  transition: transform 0.3s ease;
}

.card-3d:hover {
  transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

---

## ✅ FASE 5: TESTES (1h)

### 5.1 Performance

- [ ] Lighthouse Score > 95
- [ ] Zero delay no carregamento
- [ ] Sem FOUC (Flash of Unstyled Content)
- [ ] Smooth transitions

### 5.2 Funcionalidade

- [ ] Trocar tema sem reload
- [ ] Sincronização multi-tab (cookie)
- [ ] Dark mode + tema colorido funcionam juntos
- [ ] 3 roles com temas independentes

### 5.3 Acessibilidade

- [ ] Contraste WCAG AAA
- [ ] Keyboard navigation
- [ ] Screen reader friendly

---

## 🚦 CHECKLIST FINAL

- [ ] Globals.css limpo com Inter
- [ ] UserTheme table criada
- [ ] 6 presets implementados
- [ ] Middleware com cookie
- [ ] Inline script no layout
- [ ] API routes funcionais
- [ ] UI de seleção (3 roles)
- [ ] Cards avançados (4 estilos + 3D)
- [ ] Zero delay visual confirmado
- [ ] Lighthouse > 95

---

## 📝 PRÓXIMOS COMANDOS

```bash
# 1. Parar dev server
Ctrl + C

# 2. Aplicar novo schema
npx prisma migrate dev --name refactor-user-theme

# 3. Seed temas padrão
node scripts/seed-themes.ts

# 4. Reiniciar
npm run dev

# 5. Testar
http://localhost:3000/admin/settings/theme
```

---

**Aguardando aprovação para continuar com FASE 2.**

---

**Desenvolvido com excelência pela VisionVII** 🚀
