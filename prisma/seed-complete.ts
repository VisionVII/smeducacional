// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed COMPLETO do banco de dados...\n');

  // ============================================
  // PARTE 1: USUÁRIOS E DADOS BÁSICOS
  // ============================================
  console.log('👥 Criando usuários...');

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

  console.log('✅ 3 usuários criados (Admin, Professor, Aluno)\n');

  // ============================================
  // PARTE 2: CATEGORIAS
  // ============================================
  console.log('📂 Criando categorias...');

  const categoriaEJA = await prisma.category.upsert({
    where: { slug: 'eja' },
    update: {},
    create: {
      name: 'EJA - Educação de Jovens e Adultos',
      slug: 'eja',
      description:
        'Cursos de Educação de Jovens e Adultos para conclusão do Ensino Fundamental e Médio',
      icon: '🎓',
    },
  });

  const categoriaProfissionalizante = await prisma.category.upsert({
    where: { slug: 'profissionalizante' },
    update: {},
    create: {
      name: 'Formação Profissionalizante',
      slug: 'profissionalizante',
      description: 'Cursos técnicos e profissionalizantes integrados ao EJA',
      icon: '💼',
    },
  });

  const categoriaCursosLivres = await prisma.category.upsert({
    where: { slug: 'cursos-livres' },
    update: {},
    create: {
      name: 'Cursos Livres',
      slug: 'cursos-livres',
      description:
        'Cursos de apoio educacional e desenvolvimento de habilidades',
      icon: '📚',
    },
  });

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

  console.log('✅ 4 categorias criadas\n');

  // ============================================
  // PARTE 3: CURSOS EJA
  // ============================================
  console.log('📚 Criando cursos EJA...');

  // 1. EJA - Ensino Fundamental
  const ejaFundamental = await prisma.course.upsert({
    where: { slug: 'eja-ensino-fundamental-anos-finais' },
    update: {},
    create: {
      title: 'EJA - Ensino Fundamental (Anos Finais)',
      slug: 'eja-ensino-fundamental-anos-finais',
      description:
        'Curso completo de Educação de Jovens e Adultos para conclusão do Ensino Fundamental (6º ao 9º ano).',
      thumbnail:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      instructorId: teacher.id,
      categoryId: categoriaEJA.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
      duration: 1200,
    },
  });

  // Módulos do Fundamental
  const modulosFundamental = [
    {
      title: 'Língua Portuguesa - Comunicação e Expressão',
      description: 'Leitura, escrita e gramática',
      order: 1,
    },
    {
      title: 'Matemática - Raciocínio Lógico',
      description: 'Operações básicas e resolução de problemas',
      order: 2,
    },
    {
      title: 'Ciências Naturais',
      description: 'Biologia, física e química aplicadas',
      order: 3,
    },
    {
      title: 'História e Geografia',
      description: 'Cidadania e sociedade',
      order: 4,
    },
    {
      title: 'Cultura Digital',
      description: 'Alfabetização digital',
      order: 5,
    },
    {
      title: 'Habilidades Socioemocionais',
      description: 'Competências sociais',
      order: 6,
    },
  ];

  for (const modulo of modulosFundamental) {
    await prisma.module.create({
      data: { ...modulo, courseId: ejaFundamental.id },
    });
  }

  // 2. EJA - Ensino Médio
  const ejaMedio = await prisma.course.upsert({
    where: { slug: 'eja-ensino-medio-completo' },
    update: {},
    create: {
      title: 'EJA - Ensino Médio Completo',
      slug: 'eja-ensino-medio-completo',
      description:
        'Curso completo para conclusão do Ensino Médio com preparação para ENEM.',
      thumbnail:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      instructorId: teacher.id,
      categoryId: categoriaEJA.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
      duration: 1800,
    },
  });

  const modulosMedio = [
    {
      title: 'Linguagens - Português e Redação',
      description: 'Gramática e redação ENEM',
      order: 1,
    },
    {
      title: 'Matemática e suas Tecnologias',
      description: 'Matemática avançada',
      order: 2,
    },
    {
      title: 'Ciências da Natureza',
      description: 'Física, Química e Biologia',
      order: 3,
    },
    {
      title: 'Ciências Humanas',
      description: 'História, Geografia, Filosofia e Sociologia',
      order: 4,
    },
    {
      title: 'Preparação para ENEM',
      description: 'Estratégias e simulados',
      order: 5,
    },
  ];

  for (const modulo of modulosMedio) {
    await prisma.module.create({
      data: { ...modulo, courseId: ejaMedio.id },
    });
  }

  console.log('✅ 2 cursos EJA criados com 11 módulos\n');

  // ============================================
  // PARTE 4: CURSOS PROFISSIONALIZANTES
  // ============================================
  console.log('💼 Criando cursos profissionalizantes...');

  // 3. Técnico em Administração
  const profAdministracao = await prisma.course.upsert({
    where: { slug: 'formacao-tecnica-administracao' },
    update: {},
    create: {
      title: 'Formação Técnica em Administração',
      slug: 'formacao-tecnica-administracao',
      description:
        'Curso profissionalizante completo em administração de empresas.',
      thumbnail:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      instructorId: teacher.id,
      categoryId: categoriaProfissionalizante.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
      duration: 960,
    },
  });

  const modulosAdmin = [
    {
      title: 'Fundamentos da Administração',
      description: 'Conceitos básicos',
      order: 1,
    },
    { title: 'Gestão de Pessoas', description: 'RH e liderança', order: 2 },
    {
      title: 'Gestão Financeira',
      description: 'Contabilidade e finanças',
      order: 3,
    },
    {
      title: 'Marketing e Vendas',
      description: 'Estratégias comerciais',
      order: 4,
    },
  ];

  for (const modulo of modulosAdmin) {
    await prisma.module.create({
      data: { ...modulo, courseId: profAdministracao.id },
    });
  }

  // 4. Técnico em Informática
  const profInformatica = await prisma.course.upsert({
    where: { slug: 'formacao-tecnica-informatica' },
    update: {},
    create: {
      title: 'Formação Técnica em Informática',
      slug: 'formacao-tecnica-informatica',
      description: 'Curso profissionalizante de informática básica e avançada.',
      thumbnail:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      instructorId: teacher.id,
      categoryId: categoriaProfissionalizante.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
      duration: 720,
    },
  });

  const modulosInfo = [
    {
      title: 'Informática Básica',
      description: 'Windows, Office e Internet',
      order: 1,
    },
    {
      title: 'Excel Avançado',
      description: 'Planilhas e análise de dados',
      order: 2,
    },
    {
      title: 'Introdução à Programação',
      description: 'Lógica e algoritmos',
      order: 3,
    },
    {
      title: 'Manutenção de Computadores',
      description: 'Hardware e software',
      order: 4,
    },
  ];

  for (const modulo of modulosInfo) {
    await prisma.module.create({
      data: { ...modulo, courseId: profInformatica.id },
    });
  }

  console.log('✅ 2 cursos profissionalizantes criados com 8 módulos\n');

  // ============================================
  // PARTE 5: CURSOS LIVRES
  // ============================================
  console.log('📖 Criando cursos livres...');

  // 5. Redação para ENEM
  const livreRedacao = await prisma.course.upsert({
    where: { slug: 'redacao-para-enem-curso-intensivo' },
    update: {},
    create: {
      title: 'Redação para ENEM - Curso Intensivo',
      slug: 'redacao-para-enem-curso-intensivo',
      description:
        'Técnicas de redação dissertativa-argumentativa para nota 1000.',
      thumbnail:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
      instructorId: teacher.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
      duration: 240,
    },
  });

  const modulosRedacao = [
    {
      title: 'Estrutura da Redação ENEM',
      description: 'Dissertação-argumentativa',
      order: 1,
    },
    {
      title: 'Argumentação e Repertório',
      description: 'Técnicas de argumentação',
      order: 2,
    },
    {
      title: 'Proposta de Intervenção',
      description: 'Como elaborar propostas',
      order: 3,
    },
    {
      title: 'Prática e Correção',
      description: 'Exercícios e feedback',
      order: 4,
    },
  ];

  for (const modulo of modulosRedacao) {
    await prisma.module.create({
      data: { ...modulo, courseId: livreRedacao.id },
    });
  }

  // 6. Soft Skills
  const livreSoftSkills = await prisma.course.upsert({
    where: { slug: 'soft-skills-e-empregabilidade' },
    update: {},
    create: {
      title: 'Soft Skills e Empregabilidade',
      slug: 'soft-skills-e-empregabilidade',
      description: 'Habilidades comportamentais para o mercado de trabalho.',
      thumbnail:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      instructorId: teacher.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
      duration: 180,
    },
  });

  const modulosSoftSkills = [
    {
      title: 'Comunicação Eficaz',
      description: 'Verbal e não-verbal',
      order: 1,
    },
    {
      title: 'Trabalho em Equipe',
      description: 'Colaboração e conflitos',
      order: 2,
    },
    {
      title: 'Inteligência Emocional',
      description: 'Autoconhecimento e empatia',
      order: 3,
    },
    {
      title: 'Currículo e Entrevista',
      description: 'Preparação profissional',
      order: 4,
    },
  ];

  for (const modulo of modulosSoftSkills) {
    await prisma.module.create({
      data: { ...modulo, courseId: livreSoftSkills.id },
    });
  }

  // 7. Matemática Essencial
  const aceleracaoMatematica = await prisma.course.upsert({
    where: { slug: 'trilha-aceleracao-matematica-essencial' },
    update: {},
    create: {
      title: 'Trilha de Aceleração - Matemática Essencial',
      slug: 'trilha-aceleracao-matematica-essencial',
      description: 'Conceitos essenciais de matemática de alto impacto.',
      thumbnail:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      instructorId: teacher.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
      duration: 120,
    },
  });

  const modulosAceleracao = [
    {
      title: 'Operações Básicas e Frações',
      description: 'Revisão intensiva',
      order: 1,
    },
    {
      title: 'Porcentagens e Regra de Três',
      description: 'Cálculos práticos',
      order: 2,
    },
    { title: 'Geometria Prática', description: 'Áreas e volumes', order: 3 },
  ];

  for (const modulo of modulosAceleracao) {
    await prisma.module.create({
      data: { ...modulo, courseId: aceleracaoMatematica.id },
    });
  }

  // 8. Curso introdutório
  const introReact = await prisma.course.upsert({
    where: { slug: 'introducao-ao-react' },
    update: {},
    create: {
      title: 'Introdução ao React',
      slug: 'introducao-ao-react',
      description: 'Aprenda os fundamentos do React.js do zero',
      level: 'Iniciante',
      duration: 600,
      price: 0,
      isPublished: true,
      categoryId: webDev.id,
      instructorId: teacher.id,
    },
  });

  await prisma.module.create({
    data: {
      title: 'Fundamentos do React',
      description: 'Conceitos básicos e configuração',
      order: 1,
      courseId: introReact.id,
    },
  });

  console.log('✅ 4 cursos livres criados com 12 módulos\n');

  // ============================================
  // PARTE 6: MATRÍCULAS E PROGRESSO
  // ============================================
  console.log('📝 Criando matrículas...');

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: ejaFundamental.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ 1 matrícula criada\n');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     🎉 SEED COMPLETO EXECUTADO COM SUCESSO    ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log('📊 RESUMO:');
  console.log('   👥 Usuários: 3 (Admin, Professor, Aluno)');
  console.log('   📂 Categorias: 4');
  console.log('   📚 Cursos: 8');
  console.log('   📖 Módulos: 32');
  console.log('   📝 Matrículas: 1\n');
  console.log('🔑 CREDENCIAIS:');
  console.log('   Admin: admin@smeducacional.com / admin123');
  console.log('   Professor: professor@smeducacional.com / teacher123');
  console.log('   Aluno: aluno@smeducacional.com / student123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
