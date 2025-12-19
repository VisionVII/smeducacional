// Script para listar buckets do Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ler .env.local manualmente
const envPath = join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    envVars[key.trim()] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando buckets no Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey?.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Listar todos os buckets
const { data: buckets, error } = await supabase.storage.listBuckets();

if (error) {
  console.error('❌ Erro ao listar buckets:', error.message);
  process.exit(1);
}

console.log(`✅ Encontrados ${buckets.length} bucket(s):\n`);
buckets.forEach((bucket, index) => {
  console.log(`[${index + 1}] ${bucket.name}`);
  console.log(`    ID: ${bucket.id}`);
  console.log(`    Public: ${bucket.public}`);
  console.log(`    Created: ${new Date(bucket.created_at).toLocaleString('pt-BR')}\n`);
});

// Se bucket 'images' existir, listar arquivos
const imagesBucket = buckets.find(b => b.name === 'images' || b.id === 'images');
if (imagesBucket) {
  console.log('✅ Bucket "images" ENCONTRADO!\n');

  // Tentar listar arquivos
  const { data: files, error: filesError } = await supabase.storage
    .from('images')
    .list('system', { limit: 10 });

  if (filesError) {
    console.log('⚠️ Erro ao listar arquivos:', filesError.message);
  } else {
    console.log(`📁 Arquivos em images/system/: ${files.length}\n`);
  }

  // Testar upload
  console.log('📤 Testando upload...');
  const testFile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const testPath = `system/test-${Date.now()}.png`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(testPath, testFile, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) {
    console.log('❌ Erro no upload:', uploadError.message);
    if (uploadError.message.includes('row-level security')) {
      console.log('\n🔐 PROBLEMA: RLS Policies não estão permitindo upload!');
      console.log('   As policies existem mas não estão funcionando corretamente.');
    }
  } else {
    console.log('✅ Upload com sucesso!', uploadData.path);

    // Limpar arquivo de teste
    await supabase.storage.from('images').remove([testPath]);
    console.log('🗑️ Arquivo de teste removido');
  }
} else {
  console.log('❌ Bucket "images" NÃO ENCONTRADO!\n');
  console.log('Buckets disponíveis:', buckets.map(b => b.name).join(', '));
}
