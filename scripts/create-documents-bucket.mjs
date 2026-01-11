/**
 * Script: Criar Bucket course-documents no Supabase
 * Execução: node scripts/create-documents-bucket.mjs
 * 
 * Este script cria automaticamente o bucket necessário para o sistema de documentos.
 * Requisito: SUPABASE_SERVICE_ROLE_KEY no .env.local
 * 
 * ALTERNATIVA: Execute o SQL fornecido diretamente no Supabase Dashboard (mais confiável)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Carregar variáveis manualmente do .env.local
function loadEnv() {
  try {
    const envFile = readFileSync('.env.local', 'utf-8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn('⚠️  Não foi possível ler .env.local, usando variáveis de ambiente do sistema');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas');
  console.error('Configure seu .env.local antes de executar este script.');
  console.log('');
  console.log('📋 ALTERNATIVA: Execute este SQL no Supabase Dashboard (SQL Editor):');
  console.log('');
  printSQLInstructions();
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDocumentsBucket() {
  console.log('🔧 Criando bucket course-documents...');

  try {
    // 1. Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(b => b.name === 'course-documents');

    if (bucketExists) {
      console.log('ℹ️  Bucket "course-documents" já existe. Pulando criação.');
      return;
    }

    // 2. Criar bucket
    const { data, error } = await supabase.storage.createBucket('course-documents', {
      public: false, // NÃO público (requer signed URLs)
      fileSizeLimit: 52428800, // 50 MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
    });

    if (error) {
      console.error('❌ Erro ao criar bucket:', error);
      return;
    }

    console.log('✅ Bucket "course-documents" criado com sucesso!');
    console.log('📋 Configurações:');
    console.log('   - Público: NÃO (requer signed URLs)');
    console.log('   - Tamanho máximo: 50 MB');
    console.log('   - Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX');
    console.log('');
    console.log('⚠️  PRÓXIMO PASSO: Configure as políticas RLS');
    console.log('');
    printSQLInstructions();
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    console.log('');
    console.log('📋 ALTERNATIVA: Crie o bucket manualmente usando este SQL:');
    console.log('');
    printSQLInstructions();
  }
}

function printSQLInstructions() {
  console.log(`-- 1. Vá em Supabase Dashboard → SQL Editor
-- 2. Cole este SQL e execute:

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-documents',
  'course-documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS
CREATE POLICY "Admins e Teachers podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-documents' AND
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE role IN ('ADMIN', 'TEACHER')
  )
);

CREATE POLICY "Apenas autenticados podem ler (signed URLs)"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Apenas autor ou admin pode deletar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-documents' AND
  (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'ADMIN')
  )
);
`);
}

createDocumentsBucket();
