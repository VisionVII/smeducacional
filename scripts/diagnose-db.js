const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function diagnosticDatabase() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DO BANCO DE DADOS\n');

    // 1. Verificar conexão
    console.log('1️⃣ Testando conexão com banco...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // 2. Verificar qual banco está conectado
    console.log('2️⃣ Verificando banco conectado...');
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database() as database, 
             current_schema() as schema,
             version() as version
    `;
    console.log('Database:', dbInfo[0].database);
    console.log('Schema:', dbInfo[0].schema);
    console.log('Version:', dbInfo[0].version.substring(0, 50) + '...\n');

    // 3. Listar todas as tabelas
    console.log('3️⃣ Listando tabelas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log(`Total de tabelas: ${tables.length}`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log('');

    // 4. Contar registros em cada tabela principal
    console.log('4️⃣ Contando registros em tabelas principais...');

    const userCount = await prisma.user.count();
    console.log(`👥 Usuários: ${userCount}`);

    const courseCount = await prisma.course.count();
    console.log(`📚 Cursos: ${courseCount}`);

    const enrollmentCount = await prisma.enrollment.count();
    console.log(`📝 Matrículas: ${enrollmentCount}`);

    const teacherThemeCount = await prisma.teacherTheme.count();
    console.log(`🎨 Temas de professor: ${teacherThemeCount}`);
    console.log('');

    // 5. Listar usuários
    console.log('5️⃣ Detalhes dos usuários cadastrados...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      console.log('❌ NENHUM USUÁRIO ENCONTRADO!');
    } else {
      users.forEach(u => {
        console.log(`  ${u.role}: ${u.name}`);
        console.log(`    Email: ${u.email}`);
        console.log(`    ID: ${u.id}`);
        console.log(`    Criado: ${u.createdAt.toISOString()}`);
      });
    }
    console.log('');

    // 6. Verificar URL de conexão (mascarada)
    console.log('6️⃣ Verificando configuração de conexão...');
    const dbUrl = process.env.DATABASE_URL || '';
    const directUrl = process.env.DIRECT_URL || '';

    console.log('DATABASE_URL definida:', dbUrl ? 'SIM' : 'NÃO');
    if (dbUrl) {
      const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
      console.log('URL (mascarada):', maskedUrl.substring(0, 80) + '...');
    }

    console.log('DIRECT_URL definida:', directUrl ? 'SIM' : 'NÃO');
    if (directUrl) {
      const maskedDirectUrl = directUrl.replace(/:[^:@]+@/, ':****@');
      console.log('DIRECT_URL (mascarada):', maskedDirectUrl.substring(0, 80) + '...');
    }
    console.log('');

    // 7. Testar escrita
    console.log('7️⃣ Testando escrita no banco...');
    const testUser = await prisma.user.create({
      data: {
        name: 'Teste Conexão',
        email: `teste-${Date.now()}@test.com`,
        password: 'test123',
        role: 'STUDENT',
      },
    });
    console.log('✅ Escrita bem-sucedida! User ID:', testUser.id);

    // Remover usuário de teste
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Remoção bem-sucedida!\n');

    // 8. Verificar políticas RLS (Supabase)
    console.log('8️⃣ Verificando políticas RLS (se Supabase)...');
    try {
      const policies = await prisma.$queryRaw`
        SELECT schemaname, tablename, policyname, permissive, roles, cmd
        FROM pg_policies
        WHERE schemaname = 'public'
        LIMIT 5
      `;
      if (policies.length > 0) {
        console.log(`✅ Encontradas ${policies.length} políticas RLS`);
        policies.forEach(p => {
          console.log(`  - ${p.tablename}.${p.policyname}: ${p.cmd}`);
        });
      } else {
        console.log('⚠️  Nenhuma política RLS encontrada');
      }
    } catch (err) {
      console.log('⚠️  Não foi possível verificar RLS:', err.message);
    }
    console.log('');

    // Resumo final
    console.log('═══════════════════════════════════════════');
    console.log('📊 RESUMO:');
    console.log('═══════════════════════════════════════════');
    console.log(`✓ Conexão: OK`);
    console.log(`✓ Tabelas: ${tables.length}`);
    console.log(`✓ Usuários: ${userCount}`);
    console.log(`✓ Cursos: ${courseCount}`);
    console.log(`✓ Escrita/Leitura: OK`);

    if (userCount === 0) {
      console.log('\n⚠️  ATENÇÃO: Banco sem usuários!');
      console.log('Execute: npx prisma db seed');
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.code) {
      console.error('Código:', error.code);
    }
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticDatabase();
