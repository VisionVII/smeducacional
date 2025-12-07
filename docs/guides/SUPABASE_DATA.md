# 📊 Como Visualizar Dados no Supabase

## ✅ Confirmação: Banco 100% Funcional

### Diagnóstico Realizado:

- ✅ **Conexão**: Ativa com Supabase PostgreSQL 17.6
- ✅ **Tabelas**: 19 tabelas criadas
- ✅ **Usuários**: 3 usuários cadastrados
- ✅ **Temas**: 1 tema personalizado salvo
- ✅ **Cursos**: 1 curso cadastrado
- ✅ **Persistência**: Teste de escrita/leitura OK

---

## 🔍 Como Ver os Dados no Supabase Dashboard

### Passo 1: Acesse o Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **smeducacional** (ou nome do seu projeto)

### Passo 2: Navegue até Table Editor

1. No menu lateral esquerdo, clique em **"Table Editor"**
2. **IMPORTANTE**: No topo, certifique-se de que está selecionado o schema **"public"**
   - ❌ NÃO use "auth" (esse é do Supabase Auth)
   - ✅ USE "public" (onde estão nossos dados)

### Passo 3: Visualize as Tabelas

#### Tabela `users` (Usuários)

Você deve ver 3 registros:

| id                        | name                 | email                       | role    |
| ------------------------- | -------------------- | --------------------------- | ------- |
| cmivylm3v0000xeurfxpz04pa | Administrador        | admin@smeducacional.com     | ADMIN   |
| cmivylnwe0001xeurg1s569iv | Professor João Silva | professor@smeducacional.com | TEACHER |
| cmivylpq70002xeurfvmr3o6r | Maria Santos         | aluno@smeducacional.com     | STUDENT |

#### Tabela `teacher_themes` (Temas Personalizados)

Você deve ver 1 registro:

| id                        | userId                    | themeName                    | updatedAt           |
| ------------------------- | ------------------------- | ---------------------------- | ------------------- |
| cmivzpgp30001odplg57vjisu | cmivylnwe0001xeurg1s569iv | Profissional - Atualizado... | 2025-12-07 17:47:44 |

#### Outras Tabelas

- `courses`: 1 curso
- `enrollments`: 1 matrícula
- `modules`, `lessons`, `activities`, etc.: Estrutura criada

---

## 🔑 Informações de Conexão

```
Host: aws-1-sa-east-1.pooler.supabase.com
Database: postgres
Schema: public
Port: 5432 (direto) ou 6543 (pooler)
```

---

## 🧪 Comandos para Verificar Localmente

### 1. Ver todos os usuários:

```bash
node scripts/list-users.js
```

### 2. Diagnóstico completo:

```bash
node scripts/diagnose-db.js
```

### 3. Testar persistência:

```bash
node scripts/test-login-persistence.js
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: "Não vejo dados no Supabase"

**Causa**: Você está olhando o schema errado
**Solução**:

1. No Table Editor, clique no dropdown do schema
2. Selecione "public" ao invés de "auth"

### Problema 2: "Tabelas vazias"

**Causa**: Dados não foram populados
**Solução**:

```bash
npx prisma db seed
```

### Problema 3: "Erro de conexão"

**Causa**: Variáveis de ambiente não configuradas
**Solução**: Verifique `.env` com:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## ✅ Confirmação Final

**Seu banco está funcionando perfeitamente!**

Os testes confirmam:

- ✅ Dados sendo salvos
- ✅ Dados sendo lidos
- ✅ Persistência funcionando
- ✅ Temas sendo atualizados
- ✅ Usuários autenticando

**O problema é apenas de visualização no dashboard do Supabase.**

Certifique-se de estar no **schema "public"** e você verá todos os dados! 🎉
