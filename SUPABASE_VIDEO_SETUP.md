# Configuração do Supabase Storage para Vídeos

## 📦 **Passo 1: Criar Bucket de Vídeos**

1. Acesse: https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/storage/buckets
2. Clique em **New Bucket**
3. Configure:
   - **Name**: `lesson-videos`
   - **Public bucket**: ✅ **Marque como público**
   - **File size limit**: 500 MB (ou mais se precisar)
   - **Allowed MIME types**: `video/*`
4. Clique em **Create bucket**

---

## 🔐 **Passo 2: Configurar Políticas de Segurança (RLS)**

No Supabase, vá em **Storage** → **Policies** → **lesson-videos** e adicione:

### **Política 1: Permitir Upload (Professores/Admins)**
```sql
CREATE POLICY "Permitir upload de vídeos para professores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND (auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN')
);
```

### **Política 2: Leitura Pública**
```sql
CREATE POLICY "Permitir leitura pública de vídeos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');
```

### **Política 3: Atualizar apenas próprios arquivos**
```sql
CREATE POLICY "Permitir update de vídeos para professores"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-videos')
WITH CHECK ((auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN'));
```

### **Política 4: Deletar apenas próprios arquivos**
```sql
CREATE POLICY "Permitir delete de vídeos para professores"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND (auth.jwt() ->> 'role')::text IN ('TEACHER', 'ADMIN')
);
```

---

## ⚡ **Passo 3: Políticas Públicas (Para Desenvolvimento)**

Se quiser facilitar durante o desenvolvimento, use políticas públicas:

```sql
-- LEITURA PÚBLICA
CREATE POLICY "Permitir leitura pública de vídeos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- UPLOAD PÚBLICO (temporário)
CREATE POLICY "Permitir upload público de vídeos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'lesson-videos');

-- UPDATE PÚBLICO (temporário)
CREATE POLICY "Permitir update público de vídeos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'lesson-videos');

-- DELETE PÚBLICO (temporário)
CREATE POLICY "Permitir delete público de vídeos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'lesson-videos');
```

---

## 🎯 **URLs Geradas**

Os vídeos ficarão acessíveis em:
```
https://okxgsvalfwxxoxcfxmhc.supabase.co/storage/v1/object/public/lesson-videos/courses/[courseId]/lessons/[lessonId].mp4
```

---

## 📝 **Formatos de Vídeo Suportados**

- ✅ MP4 (H.264)
- ✅ WebM (VP8/VP9)
- ✅ MOV (QuickTime)
- ✅ AVI
- ✅ MKV

**Recomendado**: MP4 com codec H.264 para melhor compatibilidade

---

## 🔧 **Troubleshooting**

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se que o bucket está público

### Upload muito lento
- Considere aumentar o limite de tamanho
- Use compressão de vídeo antes do upload
- Considere serviços especializados (Vimeo, YouTube) para vídeos grandes

### Vídeo não carrega
- Verifique se o formato é suportado pelo navegador
- Teste a URL diretamente no navegador
- Confirme que o bucket é público

---

## 💡 **Alternativas para Vídeos Grandes**

Para vídeos maiores que 500MB, considere:

1. **YouTube (Unlisted)**
   - Upload gratuito
   - Streaming otimizado
   - Múltiplas resoluções

2. **Vimeo**
   - Mais profissional
   - Sem ads
   - Embedding customizado

3. **Cloudflare Stream**
   - CDN global
   - Adaptive bitrate
   - Analytics

4. **AWS S3 + CloudFront**
   - Escalável
   - CDN global
   - Controle total
