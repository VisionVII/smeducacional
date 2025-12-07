# 🎨 EXECUTAR SQL DE TEMAS AGORA

## Status Atual

- ✅ Código implementado
- ✅ Provider restaurado ao layout
- ❌ **Tabela `teacher_themes` não existe no banco**
- ❌ API retorna erro 500 ao acessar /teacher/theme

## Próximo Passo - Execute o SQL no Supabase

### 1. Abra Supabase Dashboard

```
https://supabase.com/dashboard
```

### 2. Selecione seu projeto

- Clique no projeto **smeducacional**

### 3. Acesse SQL Editor

No menu esquerdo:

- Clique em **SQL Editor** (ícone de chave inglesa)

### 4. Criar nova query

- Clique em **New Query** (botão azul no topo)
- Ou clique em **+** ao lado de "SQL Editor"

### 5. Cole o SQL abaixo

```sql
-- Add TeacherTheme table
CREATE TABLE IF NOT EXISTS teacher_themes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  palette JSONB NOT NULL DEFAULT '{"background":"0 0% 100%","foreground":"240 10% 3.9%","primary":"221.2 83.2% 53.3%","primaryForeground":"210 40% 98%","secondary":"210 40% 96.1%","secondaryForeground":"222.2 47.4% 11.2%","accent":"210 40% 96.1%","accentForeground":"222.2 47.4% 11.2%","card":"0 0% 100%","cardForeground":"240 10% 3.9%","muted":"210 40% 96.1%","mutedForeground":"215.4 16.3% 46.9%"}',
  layout JSONB NOT NULL DEFAULT '{"cardStyle":"default","borderRadius":"0.5rem","shadowIntensity":"medium","spacing":"comfortable"}',
  theme_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teacher_themes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teacher_themes_user_id ON teacher_themes(user_id);

-- Add comment
COMMENT ON TABLE teacher_themes IS 'Stores custom theme configurations for teachers';
```

### 6. Clique em "RUN" (botão azul)

- Espere a execução completar
- Você verá: **"Success. No rows returned"**

### 7. Pronto! ✅

Agora acesse no seu navegador:

```
http://localhost:3001/teacher/theme
```

E teste:

1. ✅ Página carrega sem erro
2. ✅ Selecione um tema (ex: "Pôr do Sol")
3. ✅ Cores mudam instantaneamente
4. ✅ Recarregue a página - tema persiste

## Por que foi necessário?

O Supabase em modo **pgbouncer** (grátis) bloqueia operações DDL via Prisma durante migrations. Por isso executamos diretamente no SQL Editor.

## Checklist Final

- [ ] Abri Supabase Dashboard
- [ ] Criei uma nova query no SQL Editor
- [ ] Colei o SQL acima
- [ ] Cliquei RUN e viu "Success"
- [ ] Acessei `/teacher/theme` e não há erro
- [ ] Consegui selecionar um tema
- [ ] Cores mudaram na página
- [ ] Recarreguei e tema persistiu

**Após completar isso, o sistema de temas estará 100% funcional!** 🎉

Se tiver dúvidas sobre o SQL Editor do Supabase, veja: https://supabase.com/docs/guides/database/sql-editor
