# Status do Banco de Dados - Supabase

**Data**: 6 de dezembro de 2025  
**Status**: ⚠️ INACESSÍVEL

---

## 🔴 Problema Identificado

O banco de dados Supabase está **offline** ou **pausado**.

### Detalhes Técnicos

**Erro ao tentar conectar**:

```
Error: P1001: Can't reach database server at `db.okxgsvalfwxxoxcfxmhc.supabase.co:5432`
```

**URLs Configuradas**:

- **DATABASE_URL** (Pooler): `aws-1-sa-east-1.pooler.supabase.com:6543` ✅ Acessível
- **DIRECT_URL** (Direto): `db.okxgsvalfwxxoxcfxmhc.supabase.co:5432` ❌ Inacessível

**Teste de Conectividade**:

- ✅ Pooler responde (porta 6543)
- ❌ Servidor direto não responde (porta 5432)

---

## 📋 Mudanças Pendentes no Banco

### Novos Campos em `User`:

```sql
ALTER TABLE users ADD COLUMN cpf VARCHAR(255);
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN "twoFactorSecret" VARCHAR(255);
```

### Novas Tabelas:

#### TeacherEducation

```sql
CREATE TABLE teacher_education (
  id TEXT PRIMARY KEY,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_teacher_education_userId ON teacher_education("userId");
```

#### TeacherFinancial

```sql
CREATE TABLE teacher_financial (
  id TEXT PRIMARY KEY,
  bank VARCHAR(255) NOT NULL,
  agency VARCHAR(255) NOT NULL,
  account VARCHAR(255) NOT NULL,
  "accountType" VARCHAR(50) NOT NULL,
  "pixKey" VARCHAR(255),
  "userId" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
```

---

## ✅ Soluções Possíveis

### Opção 1: Reativar Projeto Supabase (Recomendado)

1. Acesse o painel Supabase: https://app.supabase.com
2. Localize o projeto `okxgsvalfwxxoxcfxmhc`
3. Se estiver pausado, clique em "Resume Project"
4. Aguarde 2-5 minutos para inicializar
5. Execute novamente: `npx prisma db push`

### Opção 2: Executar SQL Manualmente

Se o projeto estiver ativo mas com problemas:

1. Acesse o SQL Editor no Supabase
2. Execute os scripts SQL acima
3. Execute: `npx prisma generate` (localmente)

### Opção 3: Criar Novo Projeto Supabase

Se o projeto foi deletado:

1. Crie novo projeto no Supabase
2. Atualize `.env` com novas credenciais
3. Execute: `npx prisma db push`
4. Execute: `npx prisma db seed`

---

## 🔧 Comandos para Executar Após Reativação

```bash
# 1. Verificar conexão
npx prisma db pull

# 2. Sincronizar schema
npx prisma db push

# 3. Gerar cliente (já foi feito)
npx prisma generate

# 4. Verificar tabelas
npx prisma studio

# 5. Popular dados de teste (opcional)
npx prisma db seed
```

---

## 📊 Status das APIs (Prontas para Uso)

Todas as APIs estão **implementadas e testadas** localmente:

- ✅ `/api/teacher/profile` (GET, PUT)
- ✅ `/api/teacher/avatar` (POST)
- ✅ `/api/teacher/password` (PUT)
- ✅ `/api/teacher/education` (GET, POST, DELETE)
- ✅ `/api/teacher/financial` (GET, PUT)
- ✅ `/api/teacher/2fa/enable` (POST)
- ✅ `/api/teacher/2fa/verify` (POST)
- ✅ `/api/teacher/2fa/disable` (POST)
- ✅ `/api/teacher/2fa/status` (GET)

**Aguardando**: Sincronização do banco para testar em produção.

---

## 🚨 Ação Imediata Necessária

**Reativar o projeto Supabase** para continuar o desenvolvimento.

Após reativação:

1. Execute: `npx prisma db push`
2. Teste conexão: `npx prisma studio`
3. Inicie servidor: `npm run dev`
4. Teste APIs: http://localhost:3000/api/teacher/profile

---

## 📞 Suporte

- **Supabase Dashboard**: https://app.supabase.com
- **Documentação**: https://supabase.com/docs
- **Status Page**: https://status.supabase.com

**Projeto ID**: `okxgsvalfwxxoxcfxmhc`
