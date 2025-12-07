#!/usr/bin/env node
/**
 * Validar e limpar dados orphaned em teacher_themes
 */

const { PrismaClient } = require('@prisma/client');

async function cleanup() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Validando tabela teacher_themes...\n');

    // 1. Verificar se há registros com userId NULL ou inválido
    const orphaned = await prisma.$queryRawUnsafe(`
      SELECT tt.id, tt."userId" 
      FROM teacher_themes tt
      WHERE tt."userId" IS NULL 
      OR tt."userId" NOT IN (SELECT id FROM users);
    `);

    if (orphaned.length > 0) {
      console.log(`❌ Encontrados ${orphaned.length} registros com userId inválido`);

      // Deletar registros inválidos
      const deleted = await prisma.$executeRawUnsafe(`
        DELETE FROM teacher_themes
        WHERE "userId" IS NULL 
        OR "userId" NOT IN (SELECT id FROM users);
      `);

      console.log(`✅ ${deleted} registros removidos`);
    } else {
      console.log('✅ Nenhum registro orphaned encontrado');
    }

    // 2. Verificar registros válidos
    const valid = await prisma.$queryRawUnsafe(`
      SELECT tt.id, tt."userId", u.name, u.email, tt."themeName"
      FROM teacher_themes tt
      JOIN users u ON tt."userId" = u.id
    `);

    console.log(`\n📊 Registros válidos: ${valid.length}`);
    if (valid.length > 0) {
      console.log('Temas válidos:');
      valid.forEach(t => {
        console.log(`  - ${t.name} (${t.email}): ${t.themeName || 'padrão'}`);
      });
    }

    // 3. Verificar integrity constraints
    console.log('\n🔐 Verificando constraints...');
    const constraints = await prisma.$queryRawUnsafe(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE table_name = 'teacher_themes'
      AND constraint_type = 'FOREIGN KEY';
    `);

    console.log(`FK Constraints encontradas: ${constraints.length}`);
    constraints.forEach(c => {
      console.log(`  - ${c.constraint_name}`);
    });

    console.log('\n✅ Validação completa!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
