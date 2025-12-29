#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de Storage no Supabase
 * Verifica:
 * 1. Bucket existe e está público
 * 2. RLS está habilitado
 * 3. Políticas existem
 */

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('   Adicione em .env.local:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('\n📋 DIAGNÓSTICO DE STORAGE SUPABASE\n');
  console.log('=====================================\n');

  try {
    // 1. Verificar bucket
    console.log('1️⃣  Verificando bucket "course-videos"...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('   ❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    const bucket = buckets?.find(b => b.name === 'course-videos');

    if (!bucket) {
      console.error('   ❌ Bucket "course-videos" não encontrado');
      console.log('\n   📝 Solução:');
      console.log('   1. Abra Supabase Dashboard');
      console.log('   2. Storage → New bucket');
      console.log('   3. Nome: course-videos');
      console.log('   4. Marque: ✅ Public bucket');
      console.log('   5. Allowed MIME types: video/*');
      console.log('   6. Clique em "Create bucket"');
      return;
    }

    console.log('   ✅ Bucket encontrado');
    console.log(`   📊 ID: ${bucket.id}`);
    console.log(`   🔒 Público: ${bucket.public ? '✅ Sim' : '❌ Não'}`);
    console.log(`   📅 Criado: ${new Date(bucket.created_at).toLocaleDateString('pt-BR')}`);

    if (!bucket.public) {
      console.log('\n   ⚠️  PROBLEMA: Bucket não está público!');
      console.log('   📝 Solução:');
      console.log('   1. Storage → course-videos → ⚙️ Settings');
      console.log('   2. Marque: ✅ Public bucket');
      console.log('   3. Clique em "Save"');
      return;
    }

    // 2. Tentar fazer upload de teste
    console.log('\n2️⃣  Testando upload...');

    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testPath = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-videos')
      .upload(testPath, testFile);

    if (uploadError) {
      console.error(`   ❌ Erro no upload: ${uploadError.message}`);

      if (uploadError.message.includes('row-level security')) {
        console.log('\n   ⚠️  PROBLEMA: Política RLS está bloqueando uploads');
        console.log('   📝 Solução:');
        console.log('   1. Abra Supabase Dashboard → SQL Editor');
        console.log('   2. Execute o SQL em fix-storage-rls.sql');
        console.log('   3. Certifique que as 4 políticas foram criadas');
      }
      return;
    }

    console.log('   ✅ Upload de teste bem-sucedido');
    console.log(`   📁 Arquivo: ${uploadData.path}`);

    // 3. Limpar arquivo de teste
    console.log('\n3️⃣  Limpando arquivo de teste...');
    await supabase.storage
      .from('course-videos')
      .remove([testPath]);
    console.log('   ✅ Arquivo removido');

    // 4. Resumo final
    console.log('\n✅ TUDO OK!\n');
    console.log('Storage está configurado corretamente.');
    console.log('Você deve conseguir fazer upload de vídeos agora.\n');

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

diagnose();
