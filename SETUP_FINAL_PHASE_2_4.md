# ✅ FASE 2.4 - GUIA DEFINITIVO DE SETUP

## 🎯 Você Está Aqui

Corrigimos todos os erros de infraestrutura e padrões. Agora basta seguir estes passos:

---

## 📋 PASSO-A-PASSO (Escolha Um)

### 🟢 OPÇÃO 1: Automático (Recomendado)

```bash
# Tudo em um comando - instala, migra, gera, verifica
node install-phase-2.js
```

**Próximos passos automáticos:**

1. ✅ Instala `sharp`, `@supabase/supabase-js`, `react-dropzone`, `sonner`
2. ✅ Executa migração: `npx prisma migrate dev --name add_image_models`
3. ✅ Gera Prisma Client: `npx prisma generate`
4. ✅ Verifica instalação: `node check-phase-2-setup.js`

### 🟡 OPÇÃO 2: Manual Passo-a-Passo

```bash
# 1. Instalar dependências
npm install sharp @supabase/supabase-js react-dropzone sonner

# 2. Migração do banco (CRÍTICO!)
npx prisma migrate dev --name add_image_models

# 3. Regenerar Prisma Client (IMPORTANTE!)
npx prisma generate

# 4. Iniciar servidor
npm run dev
```

### 🔴 OPÇÃO 3: Se Deu Erro

```bash
# Se teve erro de Prisma Client
node fix-prisma.js

# Se quer verificar antes de começar
node verify-schema.js

# Se precisa limpar tudo (CUIDADO - apaga dados!)
npx prisma migrate reset
npm install sharp @supabase/supabase-js react-dropzone sonner
npm run dev
```

---

## 🚀 TESTE RÁPIDO

Após executar a instalação:

```bash
# Terminal 1: Inicia o servidor
npm run dev

# Terminal 2: Verifique a instalação
node check-phase-2-setup.js
```

Esperado:

```
✅ TUDO OK! Phase 2.4 instalado corretamente.
```

Depois acesse:

```
http://localhost:3000/admin/images
```

---

## 🔐 CONFIGURAÇÃO CRÍTICA

Adicione ao `.env` (se não existir):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

Se não souber onde encontrar:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Em "Settings" → "API"
4. Copie os valores

---

## 🪣 BUCKETS SUPABASE

Crie estes buckets em https://supabase.com/dashboard → Storage:

| Nome              | Público | Limite | Formatos             |
| ----------------- | ------- | ------ | -------------------- |
| course-thumbnails | ✅      | 10MB   | JPEG, PNG, WebP      |
| profile-pictures  | ✅      | 5MB    | JPEG, PNG, WebP      |
| videos            | ✅      | 100MB  | MP4, WebM, MOV       |
| public-pages      | ✅      | 10MB   | JPEG, PNG, WebP, SVG |

**Como criar:**

1. Supabase Dashboard → Storage → "New bucket"
2. Nome: `course-thumbnails`
3. Public: ON
4. File size limit: 10485760 (10MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp`
6. Criar → Repetir para outros buckets

---

## ✅ CHECKLIST

Depois de cada passo, marque:

### Instalação

- [ ] Executou `node install-phase-2.js` ou passos manuais
- [ ] Sem erros de compilação
- [ ] `node check-phase-2-setup.js` retorna OK

### Configuração

- [ ] `.env` tem `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env` tem `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 4 buckets criados no Supabase
- [ ] Todos os buckets são públicos

### Teste

- [ ] `npm run dev` roda sem erros
- [ ] Acessa `http://localhost:3000/admin/images`
- [ ] Consegue fazer upload de imagem
- [ ] Imagem aparece na galeria
- [ ] Consegue deletar imagem
- [ ] Delete funciona (soft delete, não é permanente)

---

## 🐛 TROUBLESHOOTING

### "sharp não encontrado"

```bash
npm install sharp --legacy-peer-deps
npx prisma generate
```

### "Prisma Client não gerado"

```bash
npx prisma generate
node fix-prisma.js
```

### "Tabela Image não existe"

```bash
node verify-schema.js
# Se não tem migração, execute:
npx prisma migrate dev --name add_image_models
```

### "Auth falha no upload"

Verifique se está logado como **ADMIN** (role === 'ADMIN')

### "Supabase retorna erro 401"

Verifique `.env`:

- `NEXT_PUBLIC_SUPABASE_URL` está correto?
- `SUPABASE_SERVICE_ROLE_KEY` está correto?
- Ambos vêm do Supabase Dashboard?

### "Bucket não encontrado"

Verifique no Supabase Dashboard → Storage

- Existe `course-thumbnails`?
- Existe `profile-pictures`?
- Etc...

Se não existir, crie manualmente.

---

## 📊 ARQUITETURA

```
Cliente (React)
    ↓ POST/GET/DELETE
API Route (/api/admin/images/*)
    ↓ Validação + Auth
ImageService (lógica)
    ↓
Prisma DB + Supabase Storage
```

### Auth Padrão

```typescript
import { auth } from '@/lib/auth';
const session = await auth();
if (!session?.user.role === 'ADMIN') reject();
```

### DB Padrão

```typescript
import { prisma } from '@/lib/db';
await prisma.image.findMany(...);
```

---

## 💡 DICAS

1. **Sempre execute `npx prisma generate` após mudanças no schema**
2. **Soft delete**: Deletar marca como deletado, não remove do DB
3. **Signed URLs**: Cache de 1 hora para melhor performance
4. **Orphaned images**: Imagens sem uso podem ser limpas
5. **Multiplataforma**: Scripts em Node.js funcionam em Windows/Mac/Linux

---

## 📞 PRÓXIMOS PASSOS

Depois que Phase 2.4 estiver 100%:

**Phase 2.5 - Integration Refactoring** (8-12 Janeiro)

- Refatorar upload de cursos
- Refatorar upload de perfis
- Refatorar upload de páginas
- Refatorar upload de vídeos

**Phase 3 - Feature Access** (15 Janeiro)

- Dashboard expandido com feature controls
- Chat IA com access control
- Múltiplas dashboards por role

---

**Status:** ✅ Phase 2.4 Corrigido e Pronto  
**Ação:** Execute `node install-phase-2.js`  
**Data:** 31 Dezembro 2025  
**Governance:** VisionVII 3.0 100% Compliant ✅
