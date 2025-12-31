#!/usr/bin/env node

/**
 * QUICK PRISMA FIX
 * Regenera o Prisma Client para resolver erros de tipagem
 */

const { execSync } = require('child_process');

console.log('🔧 Regenerando Prisma Client...\n');

try {
  // Clean node_modules/.prisma
  console.log('1. Limpando cache Prisma...');
  try {
    execSync('rm -rf node_modules/.prisma', { stdio: 'ignore' });
  } catch (e) {
    // Windows
    execSync('rmdir /s /q node_modules\\.prisma', { stdio: 'ignore' });
  }

  // Regenerate
  console.log('2. Regenerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n✅ Prisma Client regenerado!');
  console.log('\n📝 Agora execute:');
  console.log('   npm run dev');
} catch (error) {
  console.error('❌ Erro ao regenerar Prisma Client:', error.message);
  process.exit(1);
}
