const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listCourses() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        title: true,
        slug: true,
        level: true,
        category: {
          select: { name: true }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            📚 CURSOS CADASTRADOS NO BANCO                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Total de cursos: ${courses.length}\n`);

    courses.forEach((course, i) => {
      console.log(`${i + 1}. ${course.title}`);
      console.log(`   Categoria: ${course.category.name}`);
      console.log(`   Nível: ${course.level || 'Não especificado'}`);
      console.log(`   Módulos: ${course._count.modules}`);
      console.log(`   Matrículas: ${course._count.enrollments}`);
      console.log('');
    });

    // Estatísticas gerais
    const stats = await prisma.$transaction([
      prisma.course.count(),
      prisma.module.count(),
      prisma.enrollment.count(),
      prisma.category.count(),
      prisma.user.count(),
    ]);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📚 Cursos: ${stats[0]}`);
    console.log(`📖 Módulos: ${stats[1]}`);
    console.log(`📝 Matrículas: ${stats[2]}`);
    console.log(`📂 Categorias: ${stats[3]}`);
    console.log(`👥 Usuários: ${stats[4]}\n`);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCourses();
