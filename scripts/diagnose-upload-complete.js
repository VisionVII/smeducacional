/**
 * 🔍 TESTE COMPLETO DE UPLOAD - DEBUG PROFUNDO
 * 
 * Este script testa TODOS os componentes do upload:
 * 1. Variáveis de ambiente
 * 2. Conexão com Supabase
 * 3. Bucket 'images' e RLS policies
 * 4. Upload direto
 * 5. Geração de URL pública
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️ ',
    info: 'ℹ️ ',
    step: '🔹',
  };

  const color = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue,
    step: colors.cyan,
  };

  console.log(`${color[type]}${icons[type]} ${message}${colors.reset}`);
}

function parseEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};

    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        vars[key.trim()] = value;
      }
    });

    return vars;
  } catch (error) {
    log('error', `Erro ao ler .env.local: ${error.message}`);
    return {};
  }
}

async function testSupabaseConnection(url, key) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    // Testa listando buckets
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return { success: false, error: error.message, buckets: [] };
    }

    return { success: true, buckets: data || [] };
  } catch (error) {
    return { success: false, error: error.message, buckets: [] };
  }
}

async function testUpload(url, key) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    // Cria arquivo de teste
    const timestamp = Date.now();
    const fileName = `test-${timestamp}.png`;
    const filePath = `system/${fileName}`;

    // PNG 1x1 transparente
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82
    ]);

    // Upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, pngBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
        statusCode: uploadError.statusCode,
        details: uploadError
      };
    }

    // Gera URL pública
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Remove arquivo de teste
    await supabase.storage.from('images').remove([filePath]);

    return {
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runFullDiagnostic() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}${colors.cyan}   🔍 DIAGNÓSTICO COMPLETO DE UPLOAD${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  // STEP 1: Variáveis de ambiente
  log('step', 'STEP 1: Verificando variáveis de ambiente...');
  const env = parseEnvFile();

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    log('error', 'NEXT_PUBLIC_SUPABASE_URL não configurada');
    process.exit(1);
  }
  log('success', `URL configurada: ${url}`);

  if (!key) {
    log('error', 'NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
    process.exit(1);
  }
  log('success', `ANON_KEY configurada (${key.length} caracteres)`);

  // Valida JWT
  const parts = key.split('.');
  if (parts.length !== 3) {
    log('error', `JWT inválido! Tem ${parts.length} partes, deveria ter 3`);
    log('warning', 'Copie a chave correta do Supabase Dashboard');
    process.exit(1);
  }
  log('success', 'JWT válido (3 partes)');

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    log('info', `   Algoritmo: ${header.alg}, Role: ${payload.role}`);
  } catch (e) {
    log('warning', 'Não foi possível decodificar JWT');
  }

  console.log();

  // STEP 2: Conexão com Supabase
  log('step', 'STEP 2: Testando conexão com Supabase...');
  const connResult = await testSupabaseConnection(url, key);

  if (!connResult.success) {
    log('error', `Falha na conexão: ${connResult.error}`);
    process.exit(1);
  }
  log('success', 'Conexão estabelecida com Supabase');

  console.log();

  // STEP 3: Buckets
  log('step', 'STEP 3: Verificando buckets...');
  log('info', `   Total de buckets: ${connResult.buckets.length}`);

  const imagesBucket = connResult.buckets.find(b => b.name === 'images');
  if (!imagesBucket) {
    log('warning', 'Bucket "images" não encontrado na listagem');
    log('info', 'Isso pode ser um problema de permissões RLS');
    log('info', 'Mas o upload ainda pode funcionar...');
  } else {
    log('success', 'Bucket "images" encontrado');
    log('info', `   Public: ${imagesBucket.public ? 'Sim' : 'Não'}`);
  }

  console.log();

  // STEP 4: Teste de Upload
  log('step', 'STEP 4: Testando upload real...');
  const uploadResult = await testUpload(url, key);

  if (!uploadResult.success) {
    log('error', `Upload falhou: ${uploadResult.error}`);

    if (uploadResult.statusCode) {
      log('info', `   Status Code: ${uploadResult.statusCode}`);
    }

    if (uploadResult.error.includes('JWT')) {
      log('warning', 'Erro relacionado ao JWT - chave pode estar incorreta');
      console.log('\n   🔧 SOLUÇÃO:');
      console.log('   1. https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api');
      console.log('   2. Copie a chave "anon" "public"');
      console.log('   3. Substitua no .env.local');
      console.log('   4. Reinicie: Ctrl+C depois npm run dev\n');
    }

    if (uploadResult.error.includes('row-level security')) {
      log('warning', 'Erro de RLS Policy - permissões bloqueando upload');
      console.log('\n   🔧 SOLUÇÃO:');
      console.log('   Execute no SQL Editor do Supabase:\n');
      console.log('   -- Permite uploads públicos no bucket images');
      console.log('   DROP POLICY IF EXISTS "Public upload on images" ON storage.objects;');
      console.log('   CREATE POLICY "Public upload on images"');
      console.log('   ON storage.objects FOR INSERT');
      console.log('   WITH CHECK (bucket_id = \'images\');\n');
    }

    process.exit(1);
  }

  log('success', 'Upload realizado com sucesso!');
  log('info', `   Path: ${uploadResult.path}`);
  log('info', `   URL: ${uploadResult.url}`);

  console.log();

  // STEP 5: Resultado Final
  console.log('='.repeat(70));
  log('success', 'TODOS OS TESTES PASSARAM! ✨');
  console.log('='.repeat(70));

  console.log(`\n${colors.bright}${colors.green}🎉 CONFIGURAÇÃO 100% FUNCIONAL!${colors.reset}\n`);
  console.log('   📋 Checklist Final:');
  console.log('   ✅ Variáveis de ambiente corretas');
  console.log('   ✅ JWT válido');
  console.log('   ✅ Conexão com Supabase OK');
  console.log('   ✅ Bucket "images" acessível');
  console.log('   ✅ Upload funcionando');
  console.log('   ✅ URL pública gerada');

  console.log(`\n${colors.yellow}⚠️  SE O ERRO PERSISTIR NO BROWSER:${colors.reset}\n`);
  console.log('   1. REINICIE o servidor Next.js:');
  console.log(`      ${colors.red}Ctrl+C${colors.reset} no terminal do dev server`);
  console.log(`      Aguarde 3 segundos`);
  console.log(`      ${colors.green}npm run dev${colors.reset}`);
  console.log();
  console.log('   2. LIMPE o cache do browser:');
  console.log(`      ${colors.red}Ctrl+Shift+R${colors.reset} (hard reload)`);
  console.log(`      Ou use aba anônima`);
  console.log();
  console.log('   3. VERIFIQUE os logs do servidor:');
  console.log(`      Procure por: ${colors.cyan}[upload-branding]${colors.reset}`);
  console.log(`      Se houver erro, copie e me envie`);
  console.log();
  console.log('   4. TESTE novamente:');
  console.log(`      Admin → Settings → Branding → Upload Logo`);
  console.log();
}

runFullDiagnostic().catch(error => {
  console.error(`\n${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});
