# 🚀 INSTALAÇÃO RÁPIDA - Phase 2.4

## Para Instalar TUDO de Uma Vez:

### Windows:

```bash
.\install-phase-2.bat
```

### Linux/Mac:

```bash
npm install sharp @supabase/supabase-js react-dropzone sonner
npx prisma migrate dev --name add_image_models
npx prisma generate
node check-phase-2-setup.js
```

## Verificar Instalação:

```bash
node check-phase-2-setup.js
```

Este script verifica:

- ✅ Dependências instaladas
- ✅ Arquivos criados
- ✅ Schema Prisma
- ✅ Variáveis de ambiente
- ✅ Prisma Client
- ✅ Migrações aplicadas

## Teste Rápido:

1. **Inicie o servidor:**

```bash
npm run dev
```

2. **Acesse a página de testes:**

```
http://localhost:3000/admin/images
```

3. **Teste o Upload:**
   - Vá em "Configurações" → "Gerenciar Imagens"
   - Arraste uma imagem
   - Verifique se aparece na galeria

## Se Houver Erros:

### Erro: "sharp não encontrado"

```bash
npm install sharp --legacy-peer-deps
```

### Erro: "Prisma Client não gerado"

```bash
npx prisma generate
```

### Erro: "Tabela Image não existe"

```bash
npx prisma migrate dev --name add_image_models
```

### Erro: "Supabase URL não configurada"

Adicione no `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

## Buckets do Supabase:

Crie estes buckets no Supabase Dashboard:

1. **course-thumbnails** (Público, 10MB, JPEG/PNG/WebP)
2. **profile-pictures** (Público, 5MB, JPEG/PNG/WebP)
3. **videos** (Público, 100MB, MP4/WebM/MOV)
4. **public-pages** (Público, 10MB, JPEG/PNG/WebP/SVG)

## Status da Instalação:

Execute para ver o status:

```bash
node check-phase-2-setup.js
```

Output esperado:

```
✅ TUDO OK! Phase 2.4 instalado corretamente.
```

---

**Precisa de ajuda?** Envie o output de `check-phase-2-setup.js`
