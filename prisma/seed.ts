// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de exemplo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@smeducacional.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@smeducacional.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'professor@smeducacional.com' },
    update: {},
    create: {
      name: 'Professor João Silva',
      email: 'professor@smeducacional.com',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'aluno@smeducacional.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'aluno@smeducacional.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  // Criar categorias
  const webDev = await prisma.category.upsert({
    where: { slug: 'desenvolvimento-web' },
    update: {},
    create: {
      name: 'Desenvolvimento Web',
      slug: 'desenvolvimento-web',
      description: 'Cursos de desenvolvimento para a web',
      icon: '💻',
    },
  });

  // Criar curso de exemplo
  const course = await prisma.course.upsert({
    where: { slug: 'introducao-ao-react' },
    update: {},
    create: {
      title: 'Introdução ao React',
      slug: 'introducao-ao-react',
      description: 'Aprenda os fundamentos do React.js do zero',
      level: 'Iniciante',
      duration: 600,
      isPaid: false,
      isPublished: true,
      requirements: 'Conhecimento básico de JavaScript',
      whatYouLearn: 'Componentes, Hooks, Estado, Props, Roteamento',
      categoryId: webDev.id,
      instructorId: teacher.id,
    },
  });

  // Criar módulos
  const module1 = await prisma.module.create({
    data: {
      title: 'Fundamentos do React',
      description: 'Conceitos básicos e configuração',
      order: 1,
      courseId: course.id,
    },
  });

  // Criar aulas
  await prisma.lesson.create({
    data: {
      title: 'O que é React?',
      description: 'Introdução ao React e suas vantagens',
      content:
        'React é uma biblioteca JavaScript para construir interfaces de usuário...',
      order: 1,
      isFree: true,
      duration: 600,
      moduleId: module1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Configurando o ambiente',
      description: 'Instalação e configuração inicial',
      content: 'Vamos configurar nosso ambiente de desenvolvimento...',
      order: 2,
      isFree: true,
      duration: 900,
      moduleId: module1.id,
    },
  });

  // Matricular aluno no curso
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      progress: 25,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📝 Usuários criados:');
  console.log('Admin: admin@smeducacional.com / admin123');
  console.log('Professor: professor@smeducacional.com / teacher123');
  console.log('Aluno: aluno@smeducacional.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
