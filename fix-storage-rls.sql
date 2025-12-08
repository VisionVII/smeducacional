-- ================================================================
-- POLÍTICAS RLS PARA STORAGE: course-videos
-- Execute este SQL no SQL Editor do Supabase
-- ================================================================

-- ⚠️ IMPORTANTE: 
-- Execute no SQL Editor do Supabase Dashboard
-- Você deve estar logado como proprietário do projeto

-- ================================================================
-- PASSO 1: Configurar o bucket como PÚBLICO
-- ================================================================
-- Vá em: Storage → course-videos → Settings (⚙️)
-- Marque: ✅ Public bucket
-- Isso é necessário para permitir acesso de leitura público

-- ================================================================
-- PASSO 2: Remover políticas antigas (se existirem)
-- ================================================================

DROP POLICY IF EXISTS "Public read access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete videos" ON storage.objects;

-- ================================================================
-- PASSO 3: Criar políticas PÚBLICAS (para testes)
-- ================================================================
-- Qualquer pessoa pode ler, fazer upload, editar e deletar

-- LEITURA: Público
CREATE POLICY "Public read access for course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- INSERT: Público
CREATE POLICY "Public insert access for course videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-videos');

-- UPDATE: Público
CREATE POLICY "Public update access for course videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-videos');

-- DELETE: Público
CREATE POLICY "Public delete access for course videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-videos');

-- ================================================================
-- VERIFICAÇÃO
-- Execute para confirmar que as políticas foram criadas
-- ================================================================

-- Ver todas as políticas do storage
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%course%video%'
ORDER BY policyname;

-- Deve retornar 4 políticas:
-- 1. Public read access for course videos (SELECT) - Qualquer pessoa
-- 2. Public insert access for course videos (INSERT) - Qualquer pessoa
-- 3. Public update access for course videos (UPDATE) - Qualquer pessoa
-- 4. Public delete access for course videos (DELETE) - Qualquer pessoa

-- ⚠️ DEPOIS DO TESTE, EXECUTE ISTO PARA RESTRIÇÃO DE PRODUÇÃO:
/*
==========================
POLÍTICAS DE PRODUÇÃO
Aplicar após concluir os testes.
Regras: leitura pública, gravação somente TEACHER/ADMIN autenticados
==========================

-- 1) Limpar políticas públicas
DROP POLICY IF EXISTS "Public read access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for course materials" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for course materials" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for course materials" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for course materials" ON storage.objects;

-- 2) COURSE VIDEOS (leitura pública, gravação TEACHER/ADMIN)
CREATE POLICY "Course videos - read (public)"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

CREATE POLICY "Course videos - insert (teacher/admin)"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Course videos - update (teacher/admin)"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Course videos - delete (teacher/admin)"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- 3) LESSON VIDEOS (leitura pública, gravação TEACHER/ADMIN)
CREATE POLICY "Lesson videos - read (public)"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-videos');

CREATE POLICY "Lesson videos - insert (teacher/admin)"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Lesson videos - update (teacher/admin)"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Lesson videos - delete (teacher/admin)"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-videos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- 4) COURSE MATERIALS (leitura pública, gravação TEACHER/ADMIN)
CREATE POLICY "Course materials - read (public)"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');

CREATE POLICY "Course materials - insert (teacher/admin)"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Course materials - update (teacher/admin)"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-materials'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

CREATE POLICY "Course materials - delete (teacher/admin)"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-materials'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);
*/
