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

DROP POLICY IF EXISTS "Permitir leitura pública de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update videos" ON storage.objects;

-- ================================================================
-- PASSO 3: Criar políticas restritas (PRODUÇÃO)
-- ================================================================
-- Apenas TEACHER e ADMIN autenticados podem gerenciar vídeos

-- LEITURA: Público (todos podem assistir os vídeos)
CREATE POLICY "Public read access for course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- INSERT: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- UPDATE: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can update videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- DELETE: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can delete videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

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
-- 1. Public read access for course videos (SELECT) - Todos podem visualizar
-- 2. Teachers can upload videos (INSERT) - Apenas TEACHER/ADMIN
-- 3. Teachers can update videos (UPDATE) - Apenas TEACHER/ADMIN
-- 4. Teachers can delete videos (DELETE) - Apenas TEACHER/ADMIN
