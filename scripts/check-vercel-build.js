#!/usr/bin/env node

/**
 * Script para verificar o status da última build no Vercel
 * Requer: Vercel CLI instalado (npm install -g vercel)
 * 
 * Uso: node scripts/check-vercel-build.js
 */

const { execSync } = require('child_process');

console.log('🔍 Verificando status da build Vercel...\n');

try {
  // Tentar obter informações do projeto Vercel
  const output = execSync('vercel projects list --json', {
    encoding: 'utf-8',
    cwd: process.cwd()
  });

  const projects = JSON.parse(output);
  console.log('📋 Projetos Vercel encontrados:');
  projects.forEach(p => {
    console.log(`  - ${p.name} (${p.accountId})`);
  });

  // Tentar obter deployments recentes
  console.log('\n📦 Últimas deployments:');
  try {
    const deploysOutput = execSync('vercel deploy --list --limit 5', {
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    console.log(deploysOutput);
  } catch (e) {
    console.error('ℹ️ Use o Vercel Dashboard para ver deployments:', e);
    console.log('ℹ️ Use o Vercel Dashboard para ver deployments:');
    console.log('   https://vercel.com/dashboard/projects/smeducacional');
  }
} catch (error) {
  console.error('❌ Erro ao verificar build:');
  console.error(error.message);

  console.log('\n💡 Alternativas:');
  console.log('1. Instale Vercel CLI: npm install -g vercel');
  console.log('2. Acesse o Dashboard: https://vercel.com/dashboard');
  console.log('3. Procure por "smeducacional" nos projetos');
  console.log('4. Verifique a aba "Deployments" para ver status');
}
