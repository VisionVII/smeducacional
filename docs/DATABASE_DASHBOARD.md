# 🗄️ Dashboard de Banco de Dados - VisionVII

## 📋 Visão Geral

Dashboard avançada de diagnóstico e exploração de banco de dados PostgreSQL, acessível exclusivamente para administradores através das Ferramentas do Desenvolvedor.

## 🎯 Funcionalidades

### 1. **Visualização de Tabelas**

- Lista todas as tabelas do banco (exceto system schemas)
- Mostra schema, nome da tabela e quantidade de colunas
- **Filtros:**
  - 🔍 Busca por nome de tabela
  - 📂 Filtro por schema

### 2. **Gerenciamento de Roles**

- Lista todos os roles do PostgreSQL
- Exibe permissões: Superuser, Create DB, Create Role, Login
- Mostra limite de conexões
- **Filtros:**
  - 🔍 Busca por nome de role
  - 🔐 Filtro por tipo (Com/Sem Login)

### 3. **Funções do Banco**

- Lista todas as funções PostgreSQL customizadas
- Mostra schema, nome, argumentos e tipo de retorno
- **Filtros:**
  - 🔍 Busca por nome de função
  - 📂 Filtro por schema

### 4. **Row Level Security (RLS)**

- Lista tabelas com RLS habilitado
- Mostra todas as políticas RLS configuradas
- Detalhes: nome da política, tipo (Permissive/Restrictive), comando, roles
- **Filtros:**
  - 🔍 Busca por nome de tabela

### 5. **Storage Buckets (Supabase)**

- Lista buckets de armazenamento
- Mostra visibilidade (Público/Privado)
- Exibe limites de tamanho e MIME types permitidos
- **Filtros:**
  - 🔍 Busca por nome de bucket
  - 👁️ Filtro por visibilidade

## 🚀 Como Acessar

1. Faça login como **ADMIN**
2. Acesse o **Dashboard Administrativo** (`/admin/dashboard`)
3. Na seção **Ferramentas do Desenvolvedor**, clique em **"Banco de Dados"**
4. Você será redirecionado para `/admin/dev/database`

## 🏗️ Arquitetura

### Frontend

```
/src/app/admin/dev/database/page.tsx
```

- Client Component com TanStack Query
- Tabs para cada categoria (Tabelas, Roles, Funções, RLS, Buckets)
- Filtros e busca em tempo real
- Refresh manual por categoria
- Cards de estatísticas no topo

### Backend (APIs)

```
/src/app/api/admin/dev/database/
  ├── tables/route.ts     # GET /api/admin/dev/database/tables
  ├── roles/route.ts      # GET /api/admin/dev/database/roles
  ├── functions/route.ts  # GET /api/admin/dev/database/functions
  ├── rls/route.ts        # GET /api/admin/dev/database/rls
  └── buckets/route.ts    # GET /api/admin/dev/database/buckets
```

**Segurança:**

- ✅ Todas as rotas verificam `auth()` e `role === 'ADMIN'`
- ✅ Queries SQL usam `$queryRawUnsafe` (apenas leitura)
- ✅ Limites de 100 itens por query
- ✅ Graceful error handling (retorna array vazio se falhar)

### Queries SQL Utilizadas

#### Tabelas

```sql
SELECT
  table_schema,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_schema = t.table_schema
   AND c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name LIMIT 100;
```

#### Roles

```sql
SELECT
  rolname,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolcanlogin,
  rolconnlimit
FROM pg_roles
ORDER BY rolname LIMIT 100;
```

#### Funções

```sql
SELECT
  n.nspname AS schema,
  p.proname AS name,
  pg_get_function_result(p.oid) AS return_type,
  pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname LIMIT 100;
```

#### RLS Tables

```sql
SELECT
  schemaname AS schema,
  tablename AS name,
  rowsecurity
FROM pg_tables
WHERE rowsecurity = true
ORDER BY schemaname, tablename;
```

#### RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
ORDER BY schemaname, tablename, policyname;
```

#### Storage Buckets

```sql
SELECT
  id,
  name,
  public,
  created_at,
  updated_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name LIMIT 100;
```

## 🎨 Interface

### Cards de Estatísticas

- **Tabelas**: Total de tabelas encontradas
- **Roles**: Total de roles do banco
- **Funções**: Total de funções customizadas
- **RLS**: Total de tabelas com Row Level Security
- **Buckets**: Total de buckets de armazenamento

### Tabs de Navegação

- Cada categoria tem sua própria tab
- Filtros específicos para cada tipo de dado
- Botão "Atualizar" global no header

### Componentes UI

- **Shadcn/UI**: Tabs, Card, Input, Select, Button, Badge
- **Lucide Icons**: Database, Shield, FunctionSquare, Lock, FolderOpen
- **TanStack Query**: Cache automático, loading states, refetch on demand

## 🔒 Segurança e Boas Práticas

### ✅ Implementado

1. **RBAC**: Apenas role `ADMIN` pode acessar
2. **Read-Only**: Queries apenas de leitura (SELECT)
3. **Limites**: Máximo de 100 registros por query
4. **Sanitização**: Filtros aplicados com `ILIKE` em queries parametrizadas
5. **Error Handling**: Try-catch em todas as APIs
6. **Graceful Degradation**: Retorna array vazio se query falhar
7. **BigInt Serialization**: Conversão automática para JSON

### ⚠️ Importante

- **Não expor SQL direto**: Nunca mostrar queries completas ao usuário
- **Injection Prevention**: Queries usam variáveis mas cuidado com ILIKE patterns
- **Performance**: Limitar sempre results (LIMIT 100)
- **Monitoramento**: Logs em console.error para debugging

## 📊 Casos de Uso

### Desenvolvimento

- Verificar estrutura do banco durante desenvolvimento
- Debug de policies RLS
- Validar permissões de roles
- Checar funções disponíveis

### Produção

- Diagnóstico de problemas de acesso
- Auditoria de segurança (RLS policies)
- Verificação de integridade estrutural
- Monitoramento de storage buckets

### DevOps

- Validação pós-deploy
- Documentação automática da estrutura
- Comparação entre ambientes (dev/staging/prod)

## 🛠️ Manutenção

### Adicionar Novo Tipo de Consulta

1. Criar novo endpoint em `/src/app/api/admin/dev/database/[type]/route.ts`
2. Adicionar query no componente de página
3. Criar nova tab no UI
4. Adicionar card de estatística
5. Implementar filtros específicos

### Modificar Limites

- Alterar `LIMIT` nas queries SQL (padrão: 100)
- Considerar paginação se necessário

### Adicionar Campos

- Modificar SELECT nas queries
- Atualizar interface TypeScript (any → interface específica)
- Adicionar colunas na tabela UI

## 📝 Roadmap

- [ ] Paginação para grandes volumes de dados
- [ ] Export de dados (CSV, JSON)
- [ ] Visualização de schema detalhado por tabela
- [ ] Histórico de queries executadas
- [ ] Métricas de performance por tabela
- [ ] Alertas automáticos de problemas
- [ ] Comparação entre ambientes
- [ ] SQL Query Editor (read-only)

## 🎓 Desenvolvido por VisionVII

Dashboard profissional de banco de dados, seguindo os mais altos padrões de segurança, usabilidade e arquitetura clean.

---

**Última Atualização**: 14 de dezembro de 2025  
**Versão**: 1.0.0  
**Autor**: VisionVII Development Team
