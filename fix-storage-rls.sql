-- ================================================================
-- POLÍTICAS RLS PARA STORAGE: course-videos
-- Execute este SQL no SQL Editor do Supabase
-- ================================================================

-- ⚠️ IMPORTANTE: Execute estes comandos na seguinte ordem

-- 1. HABILITAR RLS no bucket (se ainda não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Permitir leitura pública de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete público de vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

-- ================================================================
-- POLÍTICAS RESTRITAS (PRODUÇÃO)
-- Apenas TEACHER e ADMIN autenticados podem gerenciar vídeos
-- ================================================================

-- LEITURA: Público (todos podem assistir os vídeos)
CREATE POLICY "Public read access for course videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-videos');

-- INSERT: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- UPDATE: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role IN ('TEACHER', 'ADMIN')
  )
);

-- DELETE: Apenas TEACHER e ADMIN autenticados
CREATE POLICY "Teachers can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos'
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
