// Teste direto de upload (sem listar buckets)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ler .env.local
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

console.log('🔍 Testando upload direto no bucket "images"...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey?.substring(0, 30) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Criar imagem de teste (1x1 pixel PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const testImageBuffer = Buffer.from(testImageBase64, 'base64');
const testFileName = `test-${Date.now()}.png`;
const testPath = `system/${testFileName}`;

console.log('📤 Tentando fazer upload...');
console.log('   Bucket: images');
console.log('   Path:', testPath);
console.log('   Size:', testImageBuffer.length, 'bytes\n');

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('images')
  .upload(testPath, testImageBuffer, {
    contentType: 'image/png',
    upsert: false,
  });

if (uploadError) {
  console.log('❌ ERRO NO UPLOAD:');
  console.log('   Código:', uploadError.statusCode || uploadError.code);
  console.log('   Mensagem:', uploadError.message);
  console.log('   Detalhes:', JSON.stringify(uploadError, null, 2));

  if (uploadError.message.includes('row-level security')) {
    console.log('\n🔐 PROBLEMA: RLS Policy bloqueando upload');
    console.log('   Solução: As policies existem mas não estão funcionando.');
    console.log('   Verifique se a policy INSERT permite auth.role() = "authenticated"');
  } else if (uploadError.message.includes('not found')) {
    console.log('\n🗂️  PROBLEMA: Bucket não acessível via API');
    console.log('   O bucket existe visualmente mas a chave anon não consegue acessar');
  }

  process.exit(1);
} else {
  console.log('✅ UPLOAD COM SUCESSO!');
  console.log('   Path:', uploadData.path);
  console.log('   ID:', uploadData.id);

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(testPath);

  console.log('   URL:', urlData.publicUrl);

  // Limpar
  console.log('\n🗑️  Removendo arquivo de teste...');
  const { error: deleteError } = await supabase.storage
    .from('images')
    .remove([testPath]);

  if (deleteError) {
    console.log('   ⚠️  Erro ao deletar:', deleteError.message);
  } else {
    console.log('   ✅ Arquivo removido com sucesso');
  }

  console.log('\n🎉 TUDO FUNCIONANDO! O upload está OK!');
  console.log('   Agora reinicie o servidor: npm run dev');
  console.log('   E teste em: Admin → Settings → Branding');
}
