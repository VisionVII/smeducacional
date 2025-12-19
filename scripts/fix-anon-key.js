/**
 * 🔑 Script para Corrigir NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * Este script ajuda a atualizar a chave ANON com o formato correto.
 * 
 * Uso:
 *   node scripts/fix-anon-key.js [sua-nova-chave-aqui]
 * 
 * Ou execute sem argumentos para verificar a chave atual:
 *   node scripts/fix-anon-key.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

/**
 * Valida se uma string é um JWT válido
 */
function isValidJWT(token) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Tenta decodificar o header
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());

    // JWT deve ter 'alg' e 'typ'
    if (!header.alg || !header.typ) return false;

    // Supabase usa HMAC SHA256
    if (header.alg !== 'HS256') return false;

    // Tenta decodificar o payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Payload deve ter 'iss' (issuer)
    if (!payload.iss) return false;

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Lê a chave atual do .env.local
 */
function getCurrentKey() {
  try {
    const envContent = readFileSync(ENV_PATH, 'utf-8');
    const match = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('❌ Erro ao ler .env.local:', error.message);
    return null;
  }
}

/**
 * Atualiza a chave no .env.local
 */
function updateKey(newKey) {
  try {
    let envContent = readFileSync(ENV_PATH, 'utf-8');

    // Substitui a chave existente
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY="?[^"\n]+"?/,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY="${newKey}"`
    );

    writeFileSync(ENV_PATH, envContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar .env.local:', error.message);
    return false;
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n🔑 VERIFICADOR DE CHAVE ANON SUPABASE\n');
  console.log('═'.repeat(60));

  // Pega chave atual
  const currentKey = getCurrentKey();

  if (!currentKey) {
    console.log('❌ Nenhuma chave ANON encontrada no .env.local\n');
    console.log('Adicione manualmente:');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui"\n');
    process.exit(1);
  }

  // Valida chave atual
  console.log('📋 CHAVE ATUAL:');
  console.log(`   Primeiros 40 caracteres: ${currentKey.substring(0, 40)}...`);
  console.log(`   Tamanho: ${currentKey.length} caracteres`);

  const isValid = isValidJWT(currentKey);

  if (isValid) {
    console.log('   Status: ✅ JWT VÁLIDO\n');

    // Decodifica header e payload
    const parts = currentKey.split('.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    console.log('📝 DETALHES DO JWT:');
    console.log(`   Algoritmo: ${header.alg}`);
    console.log(`   Tipo: ${header.typ}`);
    console.log(`   Emissor: ${payload.iss}`);
    console.log(`   Papel: ${payload.role || 'N/A'}`);

    if (payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      console.log(`   Expira em: ${expiryDate.toLocaleString('pt-BR')}`);
    }

    console.log('\n✅ Sua chave ANON está CORRETA!');
    console.log('   O problema deve ser outro.\n');

    console.log('🔍 PRÓXIMOS PASSOS:');
    console.log('   1. Reinicie o servidor: Ctrl+C depois npm run dev');
    console.log('   2. Limpe o cache do browser: Ctrl+Shift+R');
    console.log('   3. Teste o upload novamente\n');

  } else {
    console.log('   Status: ❌ JWT INVÁLIDO\n');

    console.log('🚨 PROBLEMA DETECTADO:');
    console.log('   A chave ANON está com formato incorreto!');
    console.log('   Erro: "JWS Protected Header is invalid"\n');

    // Verifica se passou nova chave como argumento
    const newKey = process.argv[2];

    if (newKey) {
      console.log('🔄 Validando nova chave...\n');

      if (isValidJWT(newKey)) {
        console.log('✅ Nova chave é válida! Atualizando .env.local...\n');

        if (updateKey(newKey)) {
          console.log('✅ SUCESSO! Chave atualizada!\n');
          console.log('🔄 PRÓXIMOS PASSOS:');
          console.log('   1. REINICIE o servidor agora: Ctrl+C');
          console.log('   2. Execute: npm run dev');
          console.log('   3. Teste o upload\n');
        } else {
          console.log('❌ Falha ao atualizar .env.local\n');
          process.exit(1);
        }
      } else {
        console.log('❌ A nova chave também é inválida!\n');
        console.log('Verifique se você copiou a chave completa do Supabase.\n');
        process.exit(1);
      }

    } else {
      console.log('📋 COMO CORRIGIR:');
      console.log('   1. Abra: https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api');
      console.log('   2. Procure "Project API keys"');
      console.log('   3. Copie a chave "anon" "public" (começa com eyJ...)');
      console.log('   4. Execute: node scripts/fix-anon-key.js "sua-chave-copiada"\n');
      console.log('Exemplo:');
      console.log('   node scripts/fix-anon-key.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."\n');
    }
  }

  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
