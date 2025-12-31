# 🚀 PHASE 2.4 - SETUP CORRETO

## ❌ Removido

- `.bat` files (incompatível com governance multiplataforma)
- `getServerSession()` (padrão do projeto é `auth()`)

## ✅ Adicionado

- `install-phase-2.js` (multiplataforma - Node.js puro)
- `install-phase-2.sh` (bash para Unix/Linux/macOS)
- Imports corrigidos (`@/lib/db` em vez de `@/lib/prisma`)
- Auth padronizado (`auth()` de `@/lib/auth`)

---

## 📦 INSTALAÇÃO RÁPIDA

### Opção 1: Node.js (Recomendado - Funciona em Todos os Sistemas)

```bash
node install-phase-2.js
```

### Opção 2: NPM Script (Adicione ao package.json)

```bash
npm run setup:phase-2
```

No `package.json`, adicione:

```json
{
  "scripts": {
    "setup:phase-2": "node install-phase-2.js"
  }
}
```

### Opção 3: Manual (Controle Total)

```bash
# 1. Instalar dependências
npm install sharp @supabase/supabase-js react-dropzone sonner

# 2. Executar migração
npx prisma migrate dev --name add_image_models

# 3. Gerar Prisma Client
npx prisma generate

# 4. Verificar instalação
node check-phase-2-setup.js

# 5. Iniciar servidor
npm run dev
```

---

## 🔍 VERIFICAR INSTALAÇÃO

```bash
node check-phase-2-setup.js
```

Este script verifica:

- ✅ Dependências instaladas
- ✅ Arquivos criados
- ✅ Schema Prisma (modelos Image + ImageUsage)
- ✅ Variáveis de ambiente
- ✅ Prisma Client gerado
- ✅ Migrações aplicadas

---

## 🎯 TESTES

1. **Inicie o servidor:**

```bash
npm run dev
```

2. **Acesse a página:**

```
http://localhost:3000/admin
```

3. **Navegue para:**
   Configurações → Gerenciar Imagens

4. **Teste o upload:**

- Arraste uma imagem
- Verifique se aparece na galeria
- Teste o delete

---

## ⚙️ BUCKETS SUPABASE

Crie no Supabase Dashboard:

| Bucket            | Tipo    | Limite | Formatos             |
| ----------------- | ------- | ------ | -------------------- |
| course-thumbnails | Público | 10MB   | JPEG, PNG, WebP      |
| profile-pictures  | Público | 5MB    | JPEG, PNG, WebP      |
| videos            | Público | 100MB  | MP4, WebM, MOV       |
| public-pages      | Público | 10MB   | JPEG, PNG, WebP, SVG |

---

## 🔐 VARIÁVEIS DE AMBIENTE

```env
# .env ou .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

---

## 🐛 TROUBLESHOOTING

### Erro: "sharp não encontrado"

```bash
npm install sharp --legacy-peer-deps
```

### Erro: "Prisma Client não gerado"

```bash
npx prisma generate
```

### Erro: "Migração falhou"

```bash
# Reset (cuidado - apaga dados!)
npx prisma migrate reset

# Ou aplique manualmente:
npx prisma migrate deploy
```

### Erro: "Auth falha"

Verifique se está usando:

```typescript
import { auth } from '@/lib/auth';
const session = await auth();
```

### Erro: "Prisma não encontrado"

```typescript
// ❌ ERRADO
import { prisma } from '@/lib/prisma';

// ✅ CORRETO
import { prisma } from '@/lib/db';
```

---

## 📊 INFRAESTRUTURA

### Padrão Service Pattern (VisionVII 3.0)

```
Cliente
  ↓
API Route (validação + auth)
  ↓
ImageService (lógica de negócio)
  ↓
Supabase Storage + Prisma DB
```

### Auth Padrão

```typescript
// Todos os endpoints admin usam:
import { auth } from '@/lib/auth';
const session = await auth();
if (session.user.role !== 'ADMIN') {
  /* deny */
}
```

### Database Padrão

```typescript
// Todos os services usam:
import { prisma } from '@/lib/db';
await prisma.image.findMany({ ... });
```

---

## ✅ CHECKLIST FINAL

- [ ] Executou `node install-phase-2.js`
- [ ] Verificou com `node check-phase-2-setup.js`
- [ ] Criou buckets no Supabase
- [ ] Configurou variáveis de ambiente
- [ ] Servidor rodando sem erros: `npm run dev`
- [ ] Acessa `/admin/images` sem erro
- [ ] Consegue fazer upload de imagem
- [ ] Imagem aparece na galeria
- [ ] Consegue deletar imagem

---

**Versão:** VisionVII 3.0 Enterprise Governance  
**Status:** Phase 2.4 COMPLETO ✅  
**Data:** 31 Dezembro 2025
