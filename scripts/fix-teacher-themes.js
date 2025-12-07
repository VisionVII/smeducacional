#!/usr/bin/env node

/**
 * Fix Teacher Themes Table
 * Corrige a tabela teacher_themes adicionando a coluna userId
 */

const { PrismaClient } = require('@prisma/client');

async function fixTeacherThemes() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Corrigindo tabela teacher_themes...\n');

    // DROP constraints dependentes
    console.log('⏳ Removendo constraints dependentes...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE IF EXISTS "public"."teacher_themes"
      DROP CONSTRAINT IF EXISTS "teacher_themes_userId_fkey" CASCADE;
    `);

    // ADD coluna userId
    console.log('⏳ Adicionando coluna userId...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."teacher_themes"
      ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `);

    // Add FK constraint
    console.log('⏳ Adicionando foreign key...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."teacher_themes"
      ADD CONSTRAINT "teacher_themes_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
    `);

    // Create indices
    console.log('⏳ Criando índices...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "teacher_themes_userId_idx" ON "public"."teacher_themes"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "teacher_themes_userId_key" ON "public"."teacher_themes"("userId");
    `);

    console.log(`\n✨ Tabela teacher_themes corrigida com sucesso!`);

    await prisma.$disconnect();
    return 0;
  } catch (error) {
    console.error(`❌ ERRO:`, error.message);
    await prisma.$disconnect();
    return 1;
  }
}

fixTeacherThemes().then((code) => process.exit(code));
