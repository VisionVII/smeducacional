# 🔐 HABILITAR RLS NAS TABELAS DE TEACHER

## ⚠️ Alerta de Segurança

Supabase detectou que as tabelas públicas **não têm RLS habilitado**:

- `public.teacher_education`
- `public.teacher_financial`
- `public.teacher_themes`

## ✅ Solução: Executar Políticas de RLS

### 📋 O Que Fazer

**Passo 1:** Abra Supabase Dashboard

```
https://supabase.com/dashboard
```

**Passo 2:** Selecione seu projeto

**Passo 3:** Vá para SQL Editor

```
Menu lateral → SQL Editor → New Query
```

**Passo 4:** Cole o SQL abaixo

```sql
-- ====================================
-- POLÍTICAS PARA TEACHER_EDUCATION
-- ====================================

ALTER TABLE public.teacher_education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_education_select_own" ON public.teacher_education;
CREATE POLICY "teacher_education_select_own" ON public.teacher_education
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_education_insert_own" ON public.teacher_education;
CREATE POLICY "teacher_education_insert_own" ON public.teacher_education
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_education_update_own" ON public.teacher_education;
CREATE POLICY "teacher_education_update_own" ON public.teacher_education
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_education_delete_own" ON public.teacher_education;
CREATE POLICY "teacher_education_delete_own" ON public.teacher_education
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ====================================
-- POLÍTICAS PARA TEACHER_FINANCIAL
-- ====================================

ALTER TABLE public.teacher_financial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_financial_select_own" ON public.teacher_financial;
CREATE POLICY "teacher_financial_select_own" ON public.teacher_financial
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_financial_insert_own" ON public.teacher_financial;
CREATE POLICY "teacher_financial_insert_own" ON public.teacher_financial
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_financial_update_own" ON public.teacher_financial;
CREATE POLICY "teacher_financial_update_own" ON public.teacher_financial
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_financial_delete_own" ON public.teacher_financial;
CREATE POLICY "teacher_financial_delete_own" ON public.teacher_financial
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ====================================
-- POLÍTICAS PARA TEACHER_THEMES
-- ====================================

ALTER TABLE public.teacher_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_themes_select_own" ON public.teacher_themes;
CREATE POLICY "teacher_themes_select_own" ON public.teacher_themes
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_themes_insert_own" ON public.teacher_themes;
CREATE POLICY "teacher_themes_insert_own" ON public.teacher_themes
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_themes_update_own" ON public.teacher_themes;
CREATE POLICY "teacher_themes_update_own" ON public.teacher_themes
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "teacher_themes_delete_own" ON public.teacher_themes;
CREATE POLICY "teacher_themes_delete_own" ON public.teacher_themes
  FOR DELETE
  USING (auth.uid()::text = "userId");
```

CREATE POLICY "teacher_themes_delete_own" ON public.teacher_themes
FOR DELETE
USING (auth.uid()::text = "userId");

```

**Passo 5:** Clique em **RUN** (botão azul)

**Resultado esperado:**

```

Success. No rows returned

```

**Passo 6:** Verifique no Supabase

```

Vá a: Authentication → Policies
Você verá as novas políticas listadas

```

---

## 🔒 O Que Cada Política Faz

| Política       | Ação             | Restrição             |
| -------------- | ---------------- | --------------------- |
| `*_select_own` | Ver (SELECT)     | Apenas próprios dados |
| `*_insert_own` | Criar (INSERT)   | Apenas próprios dados |
| `*_update_own` | Editar (UPDATE)  | Apenas próprios dados |
| `*_delete_own` | Deletar (DELETE) | Apenas próprios dados |

---

## ✅ Verificação

Após executar o SQL, os alertas devem desaparecer:

**Antes:**

```

❌ RLS Disabled in Public
public.teacher_education [CRITICAL]
public.teacher_financial [CRITICAL]
public.teacher_themes [CRITICAL]

```

**Depois:**

```

✅ RLS Enabled
All teacher tables protected

```

---

## 📚 Referência

Para entender melhor RLS no Supabase:

- https://supabase.com/docs/guides/auth/row-level-security

---

## 📝 Checklist

- [ ] Abri Supabase Dashboard
- [ ] Criei New Query no SQL Editor
- [ ] Colei o SQL acima
- [ ] Cliquei RUN
- [ ] Vi "Success. No rows returned"
- [ ] Verifiquei alertas desapareceram

**Pronto! Tabelas protegidas por RLS!** 🔐
```
