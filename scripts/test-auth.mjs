// Script para testar NextAuth localmente
// Execute: node scripts/test-auth.mjs

import { auth } from '../src/lib/auth.js';
import { headers } from 'next/headers.js';

async function testAuth() {
  console.log('🔍 Testando NextAuth...\n');

  try {
    // Simular uma requisição autenticada
    const session = await auth();
    console.log('✅ Session obtida:', session);
  } catch (error) {
    console.error('❌ Erro ao obter session:', error);
  }
}

testAuth();
