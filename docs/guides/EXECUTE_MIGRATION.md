# 🚨 ATENÇÃO: Execute esta Migration no Supabase Dashboard

## Passos para Executar

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Clique em **New Query**
5. Cole o SQL abaixo
6. Clique em **RUN** (ou Ctrl+Enter)

## SQL para Executar

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

## Após Executar

Execute no terminal:

```powershell
npx prisma generate
```

Isso regenerará o Prisma Client com o modelo `teacherTheme`.

## Verificar Sucesso

No SQL Editor do Supabase:

```sql
SELECT * FROM teacher_themes LIMIT 1;
```

Deve retornar: "Success. No rows returned" (tabela vazia, mas existente).
