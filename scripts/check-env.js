/**
 * Verifica as variáveis de ambiente do Supabase
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

function parseEnvFile() {
  try {
    const content = readFileSync(ENV_PATH, 'utf-8');
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
    console.error('❌ Erro ao ler .env.local:', error.message);
    return {};
  }
}

console.log('\n🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE\n');
console.log('═'.repeat(70));

const env = parseEnvFile();

// Verifica SUPABASE_URL
const url = env.NEXT_PUBLIC_SUPABASE_URL;
console.log('\n📍 NEXT_PUBLIC_SUPABASE_URL:');
if (url) {
  console.log(`   ✅ SET: ${url}`);
} else {
  console.log('   ❌ NOT SET');
}

// Verifica ANON_KEY
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('\n🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY:');
if (anonKey) {
  console.log(`   ✅ SET (${anonKey.length} caracteres)`);
  console.log(`   Início: ${anonKey.substring(0, 40)}...`);

  // Valida formato JWT (3 partes)
  const parts = anonKey.split('.');
  console.log(`   Partes JWT: ${parts.length}`);

  if (parts.length === 3) {
    console.log('   ✅ Formato JWT CORRETO (3 partes)');

    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      console.log(`   Algoritmo: ${header.alg}`);
      console.log(`   Emissor: ${payload.iss}`);
      console.log(`   Role: ${payload.role}`);
    } catch (e) {
      console.log('   ⚠️  Não foi possível decodificar JWT');
    }
  } else {
    console.log('   ❌ Formato JWT INCORRETO! Deve ter 3 partes separadas por "."');
    console.log('\n   🔧 CORRIJA:');
    console.log('   1. https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api');
    console.log('   2. Copie a chave "anon" "public"');
    console.log('   3. Substitua no .env.local');
    console.log('   4. Reinicie: Ctrl+C depois npm run dev');
  }
} else {
  console.log('   ❌ NOT SET');
  console.log('\n   🔧 ADICIONE ao .env.local:');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui"');
}

console.log('\n' + '═'.repeat(70));

// Status final
if (url && anonKey && anonKey.split('.').length === 3) {
  console.log('\n✅ CONFIGURAÇÃO CORRETA! O upload deve funcionar.\n');
} else {
  console.log('\n❌ CONFIGURAÇÃO INCOMPLETA. Corrija antes de testar.\n');
  process.exit(1);
}
