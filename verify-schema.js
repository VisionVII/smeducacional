#!/usr/bin/env node

/**
 * SCHEMA VERIFICATION & MIGRATION
 * VisionVII 3.0 - Phase 2.4
 * 
 * Verifica se o schema tem os modelos Image e ImageUsage
 * Se não tiver, avisa o usuário que precisa fazer a migração
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando schema Prisma...\n');

try {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const hasImageModel = schemaContent.includes('model Image {');
  const hasImageUsageModel = schemaContent.includes('model ImageUsage {');

  if (!hasImageModel || !hasImageUsageModel) {
    console.error('❌ SCHEMA INCOMPLETO!\n');
    console.error('Os modelos Image e ImageUsage não estão no schema.prisma\n');
    console.error('EXECUTE (escolha uma opção):\n');
    console.error('Opção 1 (Recomendado):');
    console.error('  npx prisma migrate dev --name add_image_models\n');
    console.error('Opção 2 (Manual):');
    console.error('  npx prisma db push\n');
    console.error('Opção 3 (Forçado):');
    console.error('  npx prisma migrate reset');
    process.exit(1);
  }

  console.log('✅ Schema contém Image model');
  console.log('✅ Schema contém ImageUsage model\n');

  // Check if migrations exist
  const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
  if (fs.existsSync(migrationsPath)) {
    const migrations = fs.readdirSync(migrationsPath);
    const hasImageMigration = migrations.some(m => m.includes('image'));

    if (!hasImageMigration) {
      console.warn('⚠️  Aviso: Nenhuma migração de images encontrada.\n');
      console.warn('Próximos passos:');
      console.warn('1. Execute: npx prisma migrate dev --name add_image_models');
      console.warn('2. Execute: npx prisma generate');
      console.warn('3. Execute: npm run dev\n');
    } else {
      console.log('✅ Migração de images encontrada\n');
      console.log('Próximos passos:');
      console.log('1. Execute: npx prisma generate');
      console.log('2. Execute: npm run dev\n');
    }
  }
} catch (error) {
  console.error('❌ Erro ao verificar schema:', error.message);
  process.exit(1);
}
