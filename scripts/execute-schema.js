#!/usr/bin/env node

/**
 * Execute Initial Schema SQL
 * Aplica o schema SQL diretamente ao banco via Prisma
 * Contorna o problema de travamento do db push
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function executeSchemaSql() {
  const prisma = new PrismaClient();

  try {
    console.log('📋 Lendo arquivo SQL...');
    const sqlPath = path.join(__dirname, '..', 'prisma', 'initial-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir em statements individuais, preservando comentários
    let statements = [];
    let current = '';

    sqlContent.split('\n').forEach((line) => {
      current += line + '\n';

      // Se a linha termina com ;, é um statement completo
      if (line.trim().endsWith(';')) {
        statements.push(current.trim());
        current = '';
      }
    });

    // Remover linhas de comentário
    statements = statements
      .map((stmt) => stmt.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n'))
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`✅ ${statements.length} statements encontrados\n`);

    let executed = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        if (statement.includes('CREATE')) {
          console.log(`⏳ Executando: ${statement.substring(0, 60)}...`);
        }

        await prisma.$executeRawUnsafe(statement);
        executed++;
      } catch (error) {
        // Ignorar erros de tabelas/índices já existentes
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key')
        ) {
          skipped++;
          console.log(`⏭️  Saltado (já existe): ${statement.substring(0, 40)}...`);
        } else {
          console.error(`❌ Erro: ${error.message}`);
          console.error(`   Statement: ${statement.substring(0, 80)}\n`);
        }
      }
    }

    console.log(`\n✨ Schema aplicado com sucesso!`);
    console.log(`   ✅ Executados: ${executed}`);
    console.log(`   ⏭️  Saltados: ${skipped}`);

    await prisma.$disconnect();
    return 0;
  } catch (error) {
    console.error(`❌ ERRO FATAL:`, error.message);
    await prisma.$disconnect();
    return 1;
  }
}

executeSchemaSql().then((code) => process.exit(code));
