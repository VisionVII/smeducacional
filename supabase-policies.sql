-- ================================================================
-- POLÍTICAS RLS PARA BUCKET: course-thumbnails
-- Execute no SQL Editor do Supabase
-- ================================================================

-- 1. PERMITIR LEITURA PÚBLICA (obrigatório para ver as imagens)
CREATE POLICY "Permitir leitura pública de thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

-- 2. PERMITIR UPLOAD PÚBLICO (temporário para desenvolvimento)
-- ATENÇÃO: Em produção, restringir apenas para authenticated users
CREATE POLICY "Permitir upload público de thumbnails"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'course-thumbnails');

-- 3. PERMITIR UPDATE PÚBLICO (temporário para desenvolvimento)
CREATE POLICY "Permitir update público de thumbnails"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'course-thumbnails');

-- 4. PERMITIR DELETE PÚBLICO (temporário para desenvolvimento)
CREATE POLICY "Permitir delete público de thumbnails"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'course-thumbnails');

-- ================================================================
-- PARA PRODUÇÃO: Use estas políticas em vez das acima
-- ================================================================

-- Para produção, comente as políticas acima e descomente estas:

/*
-- LEITURA: Público
CREATE POLICY "Permitir leitura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

-- INSERT: Apenas usuários autenticados com role TEACHER ou ADMIN
CREATE POLICY "Permitir upload para professores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND (auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN')
);

-- UPDATE: Apenas usuários autenticados com role TEACHER ou ADMIN
CREATE POLICY "Permitir update para professores"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND (auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN')
);

-- DELETE: Apenas usuários autenticados com role TEACHER ou ADMIN
CREATE POLICY "Permitir delete para professores"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND (auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN')
);
*/
