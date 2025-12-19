/**
 * 🔍 Script de Diagnóstico Completo - Upload de Imagens
 * 
 * Este script verifica:
 * 1. Variáveis de ambiente do Supabase
 * 2. Conexão com Supabase
 * 3. Existência do bucket 'images'
 * 4. RLS policies configuradas
 * 5. Teste de upload real
 * 
 * Como usar:
 * npm run db:diagnose:upload
 * 
 * Ou diretamente:
 * node scripts/diagnose-upload.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Carrega .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (error) {
  log('⚠️  Não foi possível carregar .env.local', 'yellow');
}

async function diagnoseUpload() {
  let hasErrors = false;

  section('1. Verificando Variáveis de Ambiente');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    log('❌ NEXT_PUBLIC_SUPABASE_URL não está definida', 'red');
    hasErrors = true;
  } else {
    log('✅ NEXT_PUBLIC_SUPABASE_URL encontrada', 'green');
    log(`   URL: ${supabaseUrl}`, 'blue');
  }

  if (!supabaseAnonKey) {
    log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida', 'red');
    hasErrors = true;
  } else {
    log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada', 'green');
    log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`, 'blue');
  }

  if (hasErrors) {
    log('\n⚠️  Configure as variáveis de ambiente antes de continuar', 'yellow');
    log('   Veja: IMAGE_UPLOAD_DIAGNOSTIC.md', 'yellow');
    return;
  }

  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  section('2. Verificando Conexão com Supabase');

  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      log('❌ Erro ao conectar com Supabase:', 'red');
      log(`   ${error.message}`, 'red');
      hasErrors = true;
      return;
    }

    log('✅ Conexão com Supabase estabelecida', 'green');
    log(`   ${data.length} bucket(s) encontrado(s)`, 'blue');
  } catch (error) {
    log('❌ Erro ao conectar:', 'red');
    log(`   ${error.message}`, 'red');
    hasErrors = true;
    return;
  }

  section('3. Verificando Bucket "images"');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      log('❌ Erro ao listar buckets:', 'red');
      log(`   ${error.message}`, 'red');
      hasErrors = true;
    } else {
      const imagesBucket = buckets.find(b => b.name === 'images');

      if (!imagesBucket) {
        log('❌ Bucket "images" NÃO ENCONTRADO', 'red');
        log('\n   Para criar o bucket, execute no SQL Editor do Supabase:', 'yellow');
        log('   INSERT INTO storage.buckets (id, name, public)', 'cyan');
        log('   VALUES (\'images\', \'images\', true);', 'cyan');
        hasErrors = true;
      } else {
        log('✅ Bucket "images" encontrado', 'green');
        log(`   ID: ${imagesBucket.id}`, 'blue');
        log(`   Nome: ${imagesBucket.name}`, 'blue');
        log(`   Público: ${imagesBucket.public ? 'Sim' : 'Não'}`, 'blue');
        log(`   Criado em: ${new Date(imagesBucket.created_at).toLocaleString('pt-BR')}`, 'blue');
      }
    }
  } catch (error) {
    log('❌ Erro ao verificar bucket:', 'red');
    log(`   ${error.message}`, 'red');
    hasErrors = true;
  }

  section('4. Listando Arquivos no Bucket "images"');

  try {
    const { data: files, error } = await supabase.storage
      .from('images')
      .list('system', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      log('❌ Erro ao listar arquivos:', 'red');
      log(`   ${error.message}`, 'red');

      if (error.message.includes('not found')) {
        log('\n   O bucket "images" não existe ou não tem a pasta "system"', 'yellow');
        log('   Execute o SQL no IMAGE_UPLOAD_DIAGNOSTIC.md para criar', 'yellow');
      }
      hasErrors = true;
    } else {
      if (files.length === 0) {
        log('ℹ️  Nenhum arquivo encontrado em images/system/', 'yellow');
        log('   Isso é normal se você ainda não fez upload', 'yellow');
      } else {
        log(`✅ ${files.length} arquivo(s) encontrado(s)`, 'green');
        files.forEach((file, index) => {
          log(`\n   [${index + 1}] ${file.name}`, 'blue');
          log(`       Tamanho: ${(file.metadata.size / 1024).toFixed(2)} KB`, 'blue');
          log(`       Criado: ${new Date(file.created_at).toLocaleString('pt-BR')}`, 'blue');
        });
      }
    }
  } catch (error) {
    log('❌ Erro ao listar arquivos:', 'red');
    log(`   ${error.message}`, 'red');
  }

  section('5. Testando Upload de Imagem');

  try {
    // Criar uma imagem de teste (1x1 pixel PNG transparente)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    const testFileName = `test-${Date.now()}.png`;
    const testPath = `system/${testFileName}`;

    log('📤 Tentando fazer upload de imagem de teste...', 'yellow');
    log(`   Arquivo: ${testFileName}`, 'blue');
    log(`   Caminho: ${testPath}`, 'blue');
    log(`   Tamanho: ${testImageBuffer.length} bytes`, 'blue');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testPath, testImageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      log('\n❌ ERRO NO UPLOAD:', 'red');
      log(`   ${uploadError.message}`, 'red');

      if (uploadError.message.includes('new row violates row-level security')) {
        log('\n   🔐 PROBLEMA: RLS Policies não configuradas!', 'yellow');
        log('   Solução: Execute o SQL do IMAGE_UPLOAD_DIAGNOSTIC.md', 'yellow');
        log('   Seção: "2. Configurar RLS Policies"', 'yellow');
      } else if (uploadError.message.includes('not found')) {
        log('\n   🗂️  PROBLEMA: Bucket "images" não existe!', 'yellow');
        log('   Solução: Execute o SQL do IMAGE_UPLOAD_DIAGNOSTIC.md', 'yellow');
        log('   Seção: "1. Criar Bucket no Supabase"', 'yellow');
      }

      hasErrors = true;
    } else {
      log('\n✅ Upload realizado com SUCESSO!', 'green');
      log(`   Path: ${uploadData.path}`, 'blue');

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(testPath);

      if (urlData?.publicUrl) {
        log(`   URL pública: ${urlData.publicUrl}`, 'green');

        // Testar acesso à URL
        try {
          const response = await fetch(urlData.publicUrl);
          if (response.ok) {
            log('   ✅ URL pública acessível', 'green');
          } else {
            log(`   ⚠️  URL retornou status ${response.status}`, 'yellow');
          }
        } catch (error) {
          log('   ⚠️  Não foi possível verificar URL pública', 'yellow');
        }
      }

      // Deletar arquivo de teste
      log('\n🗑️  Removendo arquivo de teste...', 'yellow');
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([testPath]);

      if (deleteError) {
        log(`   ⚠️  Não foi possível deletar: ${deleteError.message}`, 'yellow');
      } else {
        log('   ✅ Arquivo de teste removido', 'green');
      }
    }
  } catch (error) {
    log('❌ Erro ao testar upload:', 'red');
    log(`   ${error.message}`, 'red');
    hasErrors = true;
  }

  section('📊 Resumo do Diagnóstico');

  if (hasErrors) {
    log('❌ Problemas encontrados!', 'red');
    log('\n📖 Consulte IMAGE_UPLOAD_DIAGNOSTIC.md para soluções', 'yellow');
    log('   Principais passos:', 'yellow');
    log('   1. Criar bucket "images" (se não existir)', 'cyan');
    log('   2. Configurar 4 RLS policies', 'cyan');
    log('   3. Verificar environment variables', 'cyan');

    process.exit(1);
  } else {
    log('✅ Tudo configurado corretamente!', 'green');
    log('   O sistema de upload está pronto para uso', 'green');
    log('\n🎉 Você pode fazer upload de imagens em:', 'cyan');
    log('   Admin → Settings → Branding', 'cyan');

    process.exit(0);
  }
}

// Executar diagnóstico
diagnoseUpload().catch((error) => {
  log('\n❌ Erro fatal no diagnóstico:', 'red');
  log(error.message, 'red');
  console.error(error);
  process.exit(1);
});
