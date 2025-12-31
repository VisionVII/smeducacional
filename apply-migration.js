/**
 * Script para aplicar migrations pendentes no Supabase
 * Executa: node apply-migration.js
 */

const { execSync } = require('child_process');

console.log('🔄 Aplicando migrations no Supabase...\n');

try {
  // Força regeneração do Prisma Client
  console.log('1️⃣ Gerando Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env, PRISMA_GENERATE_SKIP_AUTOINSTALL: '1' }
  });

  console.log('\n2️⃣ Aplicando migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('\n✅ Migrations aplicadas com sucesso!');
  console.log('✅ Tabela FeaturePurchase criada no Supabase!');

} catch (error) {
  console.error('\n❌ Erro ao aplicar migrations:', error.message);
  console.log('\n📋 Solução alternativa: Execute manualmente no terminal:');
  console.log('   npx prisma migrate deploy');
  process.exit(1);
}
