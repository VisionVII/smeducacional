import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed dos cursos EJA...');

  // Buscar o professor para atribuir aos cursos
  const professor = await prisma.user.findFirst({
    where: { role: 'TEACHER' },
  });

  if (!professor) {
    console.error(
      '❌ Nenhum professor encontrado. Execute o seed principal primeiro.'
    );
    return;
  }

  console.log(`✅ Professor encontrado: ${professor.name}`);

  // Buscar ou criar categorias
  const categoriaEJA = await prisma.category.upsert({
    where: { slug: 'eja' },
    update: {},
    create: {
      name: 'EJA - Educação de Jovens e Adultos',
      slug: 'eja',
      description:
        'Cursos de Educação de Jovens e Adultos para conclusão do Ensino Fundamental e Médio',
    },
  });

  const categoriaProfissionalizante = await prisma.category.upsert({
    where: { slug: 'profissionalizante' },
    update: {},
    create: {
      name: 'Formação Profissionalizante',
      slug: 'profissionalizante',
      description: 'Cursos técnicos e profissionalizantes integrados ao EJA',
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
    },
  });

  console.log('✅ Categorias criadas/atualizadas');

  // 1. EJA - Ensino Fundamental (Anos Finais)
  const ejaFundamental = await prisma.course.create({
    data: {
      title: 'EJA - Ensino Fundamental (Anos Finais)',
      slug: 'eja-ensino-fundamental-anos-finais',
      description:
        'Curso completo de Educação de Jovens e Adultos para conclusão do Ensino Fundamental (6º ao 9º ano). Reforço das competências essenciais de lógica, comunicação e cultura digital.',
      thumbnail:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      instructorId: professor.id,
      categoryId: categoriaEJA.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
    },
  });

  // Módulos do EJA Fundamental
  const modulosFundamental = [
    {
      title: 'Módulo 1: Língua Portuguesa - Comunicação e Expressão',
      description:
        'Desenvolvimento de habilidades de leitura, escrita, interpretação de textos e gramática aplicada ao cotidiano.',
      order: 1,
    },
    {
      title: 'Módulo 2: Matemática - Raciocínio Lógico e Aplicações',
      description:
        'Operações básicas, frações, porcentagens, geometria e resolução de problemas práticos do dia a dia.',
      order: 2,
    },
    {
      title: 'Módulo 3: Ciências Naturais - Mundo ao Nosso Redor',
      description:
        'Conceitos de biologia, física e química aplicados à compreensão do ambiente e saúde.',
      order: 3,
    },
    {
      title: 'Módulo 4: História e Geografia - Cidadania e Sociedade',
      description:
        'Compreensão da história brasileira, geografia do Brasil e formação para cidadania ativa.',
      order: 4,
    },
    {
      title: 'Módulo 5: Cultura Digital e Tecnologia',
      description:
        'Alfabetização digital, uso de ferramentas tecnológicas e segurança na internet.',
      order: 5,
    },
    {
      title: 'Módulo 6: Habilidades Socioemocionais',
      description:
        'Desenvolvimento de competências para o convívio social e reintegração ao mundo produtivo.',
      order: 6,
    },
  ];

  for (const modulo of modulosFundamental) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: ejaFundamental.id,
      },
    });
  }

  console.log('✅ EJA Ensino Fundamental criado com 6 módulos');

  // 2. EJA - Ensino Médio
  const ejaMedio = await prisma.course.create({
    data: {
      title: 'EJA - Ensino Médio Completo',
      slug: 'eja-ensino-medio-completo',
      description:
        'Curso completo de Educação de Jovens e Adultos para conclusão do Ensino Médio (1º, 2º e 3º ano). Consolidação de competências para acesso ao ensino superior e mercado de trabalho.',
      thumbnail:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      instructorId: professor.id,
      categoryId: categoriaEJA.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
    },
  });

  // Módulos do EJA Médio
  const modulosMedio = [
    {
      title: 'Módulo 1: Linguagens - Português e Redação',
      description:
        'Aprofundamento em gramática, literatura brasileira, interpretação de textos e técnicas de redação para ENEM.',
      order: 1,
    },
    {
      title: 'Módulo 2: Matemática e suas Tecnologias',
      description:
        'Álgebra, geometria, estatística, funções e resolução de problemas complexos.',
      order: 2,
    },
    {
      title: 'Módulo 3: Ciências da Natureza',
      description:
        'Biologia, Química e Física integradas com aplicações práticas e pensamento científico.',
      order: 3,
    },
    {
      title: 'Módulo 4: Ciências Humanas e Sociais',
      description:
        'História, Geografia, Filosofia e Sociologia para formação crítica e cidadã.',
      order: 4,
    },
    {
      title: 'Módulo 5: Preparação para ENEM e Vestibulares',
      description:
        'Estratégias de estudo, resolução de questões e simulados para exames de acesso ao ensino superior.',
      order: 5,
    },
    {
      title: 'Módulo 6: Projeto de Vida e Carreira',
      description:
        'Orientação profissional, desenvolvimento de visão sistêmica e planejamento de carreira.',
      order: 6,
    },
  ];

  for (const modulo of modulosMedio) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: ejaMedio.id,
      },
    });
  }

  console.log('✅ EJA Ensino Médio criado com 6 módulos');

  // 3. Formação Profissionalizante - Administração
  const profAdministracao = await prisma.course.create({
    data: {
      title: 'Formação Profissionalizante em Administração',
      slug: 'formacao-profissionalizante-administracao',
      description:
        'Curso técnico integrado ao EJA com foco em administração empresarial, gestão de pessoas e processos organizacionais.',
      thumbnail:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      instructorId: professor.id,
      categoryId: categoriaProfissionalizante.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
    },
  });

  const modulosAdministracao = [
    {
      title: 'Módulo 1: Fundamentos de Administração',
      description:
        'Conceitos básicos de administração, planejamento, organização e controle empresarial.',
      order: 1,
    },
    {
      title: 'Módulo 2: Gestão de Pessoas',
      description:
        'Recrutamento, seleção, treinamento e desenvolvimento de equipes.',
      order: 2,
    },
    {
      title: 'Módulo 3: Gestão Financeira',
      description:
        'Controles financeiros, fluxo de caixa, custos e formação de preços.',
      order: 3,
    },
    {
      title: 'Módulo 4: Marketing e Vendas',
      description:
        'Estratégias de marketing, atendimento ao cliente e técnicas de vendas.',
      order: 4,
    },
  ];

  for (const modulo of modulosAdministracao) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: profAdministracao.id,
      },
    });
  }

  console.log('✅ Formação em Administração criada com 4 módulos');

  // 4. Formação Profissionalizante - Informática
  const profInformatica = await prisma.course.create({
    data: {
      title: 'Formação Profissionalizante em Informática',
      slug: 'formacao-profissionalizante-informatica',
      description:
        'Curso técnico integrado ao EJA focado em tecnologia da informação, programação básica e ferramentas digitais.',
      thumbnail:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      instructorId: professor.id,
      categoryId: categoriaProfissionalizante.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
    },
  });

  const modulosInformatica = [
    {
      title: 'Módulo 1: Informática Básica e Pacote Office',
      description:
        'Windows, Word, Excel, PowerPoint e ferramentas essenciais para o trabalho.',
      order: 1,
    },
    {
      title: 'Módulo 2: Internet e Redes Sociais',
      description:
        'Navegação segura, e-mail profissional, redes sociais e marketing digital.',
      order: 2,
    },
    {
      title: 'Módulo 3: Programação e Lógica',
      description:
        'Introdução à programação, algoritmos e desenvolvimento de sistemas básicos.',
      order: 3,
    },
    {
      title: 'Módulo 4: Manutenção de Computadores',
      description:
        'Hardware, software, instalação de sistemas e resolução de problemas técnicos.',
      order: 4,
    },
  ];

  for (const modulo of modulosInformatica) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: profInformatica.id,
      },
    });
  }

  console.log('✅ Formação em Informática criada com 4 módulos');

  // 5. Curso Livre - Redação para ENEM
  const livreRedacao = await prisma.course.create({
    data: {
      title: 'Redação para ENEM - Curso Intensivo',
      slug: 'redacao-para-enem-curso-intensivo',
      description:
        'Curso focado em técnicas de redação dissertativa-argumentativa, correção de textos e estratégias para nota 1000 no ENEM.',
      thumbnail:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
      instructorId: professor.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'INTERMEDIATE',
    },
  });

  const modulosRedacao = [
    {
      title: 'Módulo 1: Estrutura da Redação ENEM',
      description:
        'Compreensão da estrutura dissertativa-argumentativa e competências avaliadas.',
      order: 1,
    },
    {
      title: 'Módulo 2: Argumentação e Repertório',
      description:
        'Técnicas de argumentação, uso de repertório sociocultural e citações.',
      order: 2,
    },
    {
      title: 'Módulo 3: Proposta de Intervenção',
      description:
        'Como elaborar propostas de intervenção completas e eficazes.',
      order: 3,
    },
    {
      title: 'Módulo 4: Prática e Correção',
      description:
        'Exercícios práticos, análise de redações nota 1000 e feedback personalizado.',
      order: 4,
    },
  ];

  for (const modulo of modulosRedacao) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: livreRedacao.id,
      },
    });
  }

  console.log('✅ Curso de Redação para ENEM criado com 4 módulos');

  // 6. Curso Livre - Soft Skills e Empregabilidade
  const livreSoftSkills = await prisma.course.create({
    data: {
      title: 'Soft Skills e Empregabilidade',
      slug: 'soft-skills-e-empregabilidade',
      description:
        'Desenvolvimento de habilidades comportamentais essenciais para o mercado de trabalho: comunicação, trabalho em equipe, liderança e inteligência emocional.',
      thumbnail:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      instructorId: professor.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
    },
  });

  const modulosSoftSkills = [
    {
      title: 'Módulo 1: Comunicação Eficaz',
      description:
        'Técnicas de comunicação verbal e não-verbal, escuta ativa e feedback construtivo.',
      order: 1,
    },
    {
      title: 'Módulo 2: Trabalho em Equipe e Colaboração',
      description:
        'Dinâmicas de grupo, resolução de conflitos e cooperação efetiva.',
      order: 2,
    },
    {
      title: 'Módulo 3: Inteligência Emocional',
      description:
        'Autoconhecimento, empatia, gestão de emoções e relacionamentos interpessoais.',
      order: 3,
    },
    {
      title: 'Módulo 4: Currículo e Entrevista de Emprego',
      description:
        'Como elaborar currículos atraentes e se preparar para entrevistas de emprego.',
      order: 4,
    },
  ];

  for (const modulo of modulosSoftSkills) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: livreSoftSkills.id,
      },
    });
  }

  console.log('✅ Curso de Soft Skills criado com 4 módulos');

  // 7. Trilha de Aceleração - Matemática Essencial
  const aceleracaoMatematica = await prisma.course.create({
    data: {
      title: 'Trilha de Aceleração - Matemática Essencial',
      slug: 'trilha-aceleracao-matematica-essencial',
      description:
        'Módulos rápidos e de alto impacto para dominar os conceitos essenciais de matemática e melhorar o desempenho acadêmico.',
      thumbnail:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      instructorId: professor.id,
      categoryId: categoriaCursosLivres.id,
      price: 0,
      isPublished: true,
      level: 'BEGINNER',
    },
  });

  const modulosAceleracao = [
    {
      title: 'Módulo 1: Operações Básicas e Frações',
      description:
        'Revisão intensiva de adição, subtração, multiplicação, divisão e frações.',
      order: 1,
    },
    {
      title: 'Módulo 2: Porcentagens e Regra de Três',
      description:
        'Cálculos percentuais e regra de três simples e composta aplicados ao cotidiano.',
      order: 2,
    },
    {
      title: 'Módulo 3: Geometria Prática',
      description:
        'Áreas, perímetros, volumes e figuras geométricas com aplicações reais.',
      order: 3,
    },
  ];

  for (const modulo of modulosAceleracao) {
    await prisma.module.create({
      data: {
        ...modulo,
        courseId: aceleracaoMatematica.id,
      },
    });
  }

  console.log('✅ Trilha de Aceleração em Matemática criada com 3 módulos');

  console.log('\n🎉 Seed dos cursos EJA concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log('- 7 cursos criados');
  console.log('- 3 categorias (EJA, Profissionalizante, Cursos Livres)');
  console.log('- 31 módulos distribuídos entre os cursos');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
