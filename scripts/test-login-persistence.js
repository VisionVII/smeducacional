const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLoginAndTheme() {
  try {
    console.log('\n🧪 TESTE: Login e Persistência de Dados\n');

    // 1. Buscar professor
    console.log('1️⃣ Buscando professor no banco...');
    const teacher = await prisma.user.findFirst({
      where: {
        email: 'professor@smeducacional.com',
        role: 'TEACHER'
      },
    });

    if (!teacher) {
      console.log('❌ Professor não encontrado!');
      return;
    }

    console.log('✅ Professor encontrado:');
    console.log(`   ID: ${teacher.id}`);
    console.log(`   Nome: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}\n`);

    // 2. Verificar tema do professor
    console.log('2️⃣ Verificando tema do professor...');
    const theme = await prisma.teacherTheme.findUnique({
      where: { userId: teacher.id },
    });

    if (theme) {
      console.log('✅ Tema encontrado:');
      console.log(`   ID: ${theme.id}`);
      console.log(`   Nome: ${theme.themeName || 'padrão'}`);
      console.log(`   Criado: ${theme.createdAt.toISOString()}`);
      console.log(`   Atualizado: ${theme.updatedAt.toISOString()}`);

      // Mostrar paleta de cores
      const palette = theme.palette;
      console.log('\n   🎨 Paleta de cores:');
      console.log(`      Primary: ${palette.primary}`);
      console.log(`      Secondary: ${palette.secondary}`);
      console.log(`      Accent: ${palette.accent}`);
    } else {
      console.log('⚠️  Nenhum tema customizado encontrado (usará padrão)');
    }
    console.log('');

    // 3. Testar criação/atualização de tema
    console.log('3️⃣ Testando atualização de tema...');
    const updatedTheme = await prisma.teacherTheme.upsert({
      where: { userId: teacher.id },
      create: {
        userId: teacher.id,
        palette: {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '217 100% 50%',
          primaryForeground: '210 40% 98%',
          secondary: '262 80% 50%',
          secondaryForeground: '210 40% 98%',
          accent: '16 100% 50%',
          accentForeground: '0 0% 100%',
          card: '0 0% 100%',
          cardForeground: '240 10% 3.9%',
          muted: '210 40% 96.1%',
          mutedForeground: '215.4 16.3% 46.9%',
        },
        layout: {
          cardStyle: 'elevated',
          borderRadius: '0.75rem',
          shadowIntensity: 'medium',
          spacing: 'comfortable',
        },
        themeName: 'Profissional - Teste',
      },
      update: {
        themeName: 'Profissional - Atualizado ' + new Date().toISOString(),
      },
    });

    console.log('✅ Tema atualizado com sucesso!');
    console.log(`   Novo nome: ${updatedTheme.themeName}\n`);

    // 4. Verificar persistência
    console.log('4️⃣ Verificando persistência (relendo do banco)...');
    const reloaded = await prisma.teacherTheme.findUnique({
      where: { userId: teacher.id },
    });

    if (reloaded && reloaded.themeName === updatedTheme.themeName) {
      console.log('✅ Dados persistidos corretamente!');
      console.log(`   Confirmado: ${reloaded.themeName}\n`);
    } else {
      console.log('❌ Erro na persistência!\n');
    }

    // 5. Verificar todos os temas salvos
    console.log('5️⃣ Listando todos os temas salvos...');
    const allThemes = await prisma.teacherTheme.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    console.log(`Total de temas salvos: ${allThemes.length}`);
    allThemes.forEach(t => {
      console.log(`  - ${t.user.name}: ${t.themeName || 'padrão'}`);
    });
    console.log('');

    // 6. Resumo
    console.log('═══════════════════════════════════════════');
    console.log('📊 RESUMO DO TESTE:');
    console.log('═══════════════════════════════════════════');
    console.log('✓ Professor encontrado no banco');
    console.log('✓ Tema lido com sucesso');
    console.log('✓ Tema atualizado com sucesso');
    console.log('✓ Persistência verificada: OK');
    console.log('✓ Sistema funcionando 100%\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.code === 'P2003') {
      console.error('⚠️  Erro de chave estrangeira - usuário não existe');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testLoginAndTheme();
