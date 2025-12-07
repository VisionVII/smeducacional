#!/usr/bin/env node

/**
 * Diagnóstico de Conectividade Postgres
 * Testa ambas as connection strings (pool e direct)
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 DIAGNÓSTICO DE CONECTIVIDADE POSTGRES\n');

  // Test DATABASE_URL (com pgbouncer)
  console.log('1️⃣  Testando DATABASE_URL (Pool com pgbouncer)...');
  const poolUrl = process.env.DATABASE_URL;
  console.log(`   URL: ${poolUrl?.substring(0, 60)}...`);

  // Test DIRECT_URL (sem pgbouncer)
  console.log('\n2️⃣  Testando DIRECT_URL (Conexão direta para migrações)...');
  const directUrl = process.env.DIRECT_URL;
  console.log(`   URL: ${directUrl?.substring(0, 60)}...`);

  // Teste com timeout
  const timeout = 15000; // 15 segundos
  console.log(`\n⏱️  Timeout configurado: ${timeout}ms\n`);

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl || poolUrl,
        },
      },
    });

    console.log('📡 Conectando ao banco de dados...');
    const startTime = Date.now();

    // Executar query simples com timeout
    const result = await Promise.race([
      prisma.$queryRaw`SELECT NOW() as current_time, version() as postgres_version`,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout: Conexão excedeu 15 segundos')),
          timeout
        )
      ),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`✅ SUCESSO! Conexão estabelecida em ${elapsed}ms`);
    console.log(`\n📊 Informações do Banco:`, result[0]);

    await prisma.$disconnect();
  } catch (error) {
    console.error(`\n❌ ERRO NA CONEXÃO:`);
    console.error(`   ${error.message}\n`);

    if (error.message.includes('timeout')) {
      console.log('💡 SUGESTÕES:');
      console.log(
        '   • Verifique se a VPN está ativa (pode estar bloqueando a conexão)'
      );
      console.log('   • Verifique se o firewall está bloqueando a porta 6543');
      console.log(
        '   • Teste a conexão direta: postgresql://...@db.rcblsqgwyvoospfsfyyf.supabase.co:5432/postgres'
      );
      console.log('   • Aumente o timeout em DATABASE_URL: ?connect_timeout=30');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 SUGESTÕES:');
      console.log(
        '   • Verifique se a senha em DATABASE_URL está correta (URL-encoded)'
      );
      console.log('   • Copie a string novamente do Supabase Dashboard');
    }

    process.exit(1);
  }
}

testConnection();
