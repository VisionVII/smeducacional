const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n');

    // 1. Contar cursos
    const totalCourses = await prisma.course.count();
    console.log(`📚 Total de cursos: ${totalCourses}`);

    if (totalCourses === 0) {
      console.log('\n⚠️ PROBLEMA: Não há cursos no banco de dados!');
      console.log('Solução: Crie cursos via Admin → Novo Curso\n');
      return;
    }

    // 2. Listar cursos
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        isFeatured: true,
        featuredAt: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
        instructor: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    console.log('\n📋 Cursos encontrados:\n');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   - ID: ${course.id}`);
      console.log(`   - Slug: ${course.slug}`);
      console.log(`   - Categoria: ${course.category?.name || 'Sem categoria'}`);
      console.log(`   - Instrutor: ${course.instructor.name}`);
      console.log(`   - Publicado: ${course.isPublished ? '✅ Sim' : '❌ Não'}`);
      console.log(`   - Promovido: ${course.isFeatured ? '⭐ Sim' : '❌ Não'}`);
      if (course.featuredAt) {
        console.log(`   - Promovido em: ${course.featuredAt}`);
      }
      console.log('');
    });

    // 3. Verificar se colunas existem
    console.log('\n🔍 Verificando estrutura da tabela...');
    const hasIsFeatured = courses.some(c => 'isFeatured' in c);
    const hasFeaturedAt = courses.some(c => 'featuredAt' in c);

    if (!hasIsFeatured || !hasFeaturedAt) {
      console.log('\n⚠️ PROBLEMA: Colunas isFeatured/featuredAt não existem!');
      console.log('Solução: npm run db:push\n');
    } else {
      console.log('✅ Estrutura da tabela está correta\n');
    }

    // 4. Contar promovidos
    const featuredCount = await prisma.course.count({
      where: { isFeatured: true },
    });
    console.log(`⭐ Cursos promovidos: ${featuredCount}`);

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
    if (error instanceof Error) {
      if (error.message.includes('column')) {
        console.log('\n⚠️ Coluna não existe no banco!');
        console.log('Rode: npm run db:push\n');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
