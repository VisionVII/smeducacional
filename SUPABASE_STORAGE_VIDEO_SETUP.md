# Configuração do Supabase Storage para Vídeos

## 📦 Sobre

Este guia explica como configurar o Supabase Storage para hospedar os vídeos das aulas da plataforma educacional.

## 🚀 Passo a Passo

### 1. Acessar Supabase Dashboard

1. Acesse [supabase.com](https://supabase.com)
2. Entre no projeto **SM Educacional**
3. No menu lateral, clique em **Storage**

### 2. Criar Bucket para Vídeos

1. Clique em **New bucket**
2. Configure o bucket:
   - **Name**: `course-videos`
   - **Public**: ✅ **Marque como público** (para permitir acesso direto aos vídeos)
   - **File size limit**: `500MB` (ou conforme sua necessidade)
   - **Allowed MIME types**: Adicione:
     - `video/mp4`
     - `video/mpeg`
     - `video/quicktime`
     - `video/x-msvideo`
     - `video/webm`
3. Clique em **Create bucket**

### 3. Configurar Políticas de Segurança (RLS)

#### 3.1. Permitir Upload Apenas para Professores/Admins

No SQL Editor do Supabase, execute:

```sql
-- Política para UPLOAD (professores e admins)
CREATE POLICY "Teachers can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND (role = 'TEACHER' OR role = 'ADMIN')
  )
);

-- Política para UPDATE (professores e admins)
CREATE POLICY "Teachers can update their videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND (role = 'TEACHER' OR role = 'ADMIN')
  )
);

-- Política para DELETE (professores e admins)
CREATE POLICY "Teachers can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND (role = 'TEACHER' OR role = 'ADMIN')
  )
);

-- Política para SELECT (leitura pública)
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-videos');
```

### 4. Configurar CORS (se necessário)

Se estiver tendo problemas de CORS, configure no dashboard:

1. Vá em **Storage** > **Configuration**
2. Em **CORS**, adicione:
   ```json
   {
     "allowedOrigins": ["http://localhost:3000", "https://seu-dominio.com"],
     "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
     "allowedHeaders": ["*"],
     "maxAge": 3600
   }
   ```

### 5. Variáveis de Ambiente

Certifique-se de que as variáveis estão configuradas no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Para operações server-side
```

## 📊 Limites e Custos

### Plano Gratuito (Free Tier)
- **Storage**: 1GB
- **Largura de banda**: 2GB/mês
- **Limite de arquivo**: 50MB por padrão (pode aumentar até 5GB)

### Plano Pro
- **Storage**: 8GB incluído (+ $0.021/GB adicional)
- **Largura de banda**: 50GB/mês (+ $0.09/GB adicional)
- **Limite de arquivo**: 5GB

## 💡 Dicas de Otimização

### 1. Compressão de Vídeos

Antes de fazer upload, comprima os vídeos usando ferramentas como:
- **HandBrake** (gratuito)
- **FFmpeg** (linha de comando)
- **CloudConvert** (online)

Comando FFmpeg para comprimir:
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
```

### 2. Usar CDN

O Supabase Storage automaticamente usa CDN global, mas você pode adicionar:
- **Cloudflare** na frente para cache adicional
- **Bunny CDN** para reduzir custos de bandwidth

### 3. Vídeos Adaptativos (HLS/DASH)

Para vídeos grandes, considere:
- Converter para HLS (HTTP Live Streaming)
- Usar múltiplas qualidades (360p, 720p, 1080p)
- Implementar streaming adaptativo

### 4. Alternativas Externas

Para reduzir custos, use vídeos hospedados externamente:
- **YouTube** (gratuito, unlimited)
- **Vimeo** (privacidade melhor)
- **Bunny Stream** ($5/mês)
- **Mux** (pay-as-you-go)

## 🔧 Troubleshooting

### Erro: "Bucket não encontrado"
✅ Verifique se criou o bucket `course-videos`
✅ Confirme que está público

### Erro: "Permission denied"
✅ Execute as políticas SQL de segurança
✅ Verifique se o usuário tem role TEACHER ou ADMIN

### Erro: "File too large"
✅ Aumente o limite no bucket
✅ Comprima o vídeo antes do upload

### Vídeo não carrega
✅ Verifique se o bucket está público
✅ Confirme a URL pública do vídeo
✅ Teste a URL diretamente no navegador

## 🎥 Estrutura de Pastas Recomendada

```
course-videos/
├── videos/
│   ├── {lessonId}-{random}.mp4
│   └── {lessonId}-{random}.mov
├── thumbnails/
│   └── {lessonId}-thumb.jpg
└── materials/
    └── {lessonId}-{fileName}.pdf
```

## 📝 Próximos Passos

Após configurar o Storage:
1. ✅ Testar upload de vídeo na área do professor
2. ✅ Testar playback na área do aluno
3. ✅ Verificar progresso sendo salvo
4. ✅ Monitorar uso de storage no dashboard

## 📚 Referências

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Pricing](https://supabase.com/pricing)
- [Video Optimization Guide](https://web.dev/fast/#optimize-your-videos)
