/**
 * Script para criar cursos de teste completos com todos os cenários de preço
 * - Curso Gratuito (price = 0)
 * - Curso Pago sem Desconto
 * - Curso Pago com Desconto
 * - Curso Premium com Desconto Alto
 * 
 * Cada curso inclui:
 * - Módulos e lições
 * - Materiais (PDFs, links)
 * - Vídeos de teste
 * - Metadados completos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URLs de vídeos de teste públicos (Big Buck Bunny - domínio público)
const TEST_VIDEOS = {
  intro: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  lesson1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  lesson2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  lesson3: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
};

// Thumbnails de teste (Unsplash)
const TEST_THUMBNAILS = {
  free: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&h=720&fit=crop',
  basic: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1280&h=720&fit=crop',
  premium: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1280&h=720&fit=crop',
  advanced: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&h=720&fit=crop',
};

async function main() {
  console.log('🚀 Iniciando criação de cursos de teste...\n');

  // Buscar professor de teste
  const teacher = await prisma.user.findFirst({
    where: { role: 'TEACHER' },
  });

  if (!teacher) {
    console.error('❌ Nenhum professor encontrado. Execute o seed principal primeiro.');
    process.exit(1);
  }

  console.log(`✅ Professor encontrado: ${teacher.name} (${teacher.email})\n`);

  // Buscar ou criar categoria de teste
  let category = await prisma.category.findFirst({
    where: { name: 'Teste' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Teste',
        slug: 'teste',
        description: 'Cursos de teste para desenvolvimento',
        icon: '🧪',
      },
    });
    console.log('✅ Categoria "Teste" criada\n');
  }

  // ========================================
  // 1. CURSO GRATUITO
  // ========================================
  console.log('📚 Criando Curso Gratuito...');
  const freeCourse = await prisma.course.create({
    data: {
      title: 'Curso Gratuito - Introdução à Programação',
      slug: 'curso-gratuito-intro-programacao',
      description: 'Aprenda os conceitos básicos de programação de forma gratuita e acessível.',
      thumbnail: TEST_THUMBNAILS.free,
      price: 0,
      originalPrice: 0,
      categoryId: category.id,
      teacherId: teacher.id,
      level: 'BEGINNER',
      duration: 180, // 3 horas
      published: true,
      featured: true,
      modules: {
        create: [
          {
            title: 'Módulo 1: Fundamentos',
            description: 'Conceitos básicos de programação',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introdução ao Curso',
                  description: 'Bem-vindo ao curso de introdução à programação',
                  content: 'Nesta aula você vai aprender sobre os conceitos fundamentais.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 15,
                  order: 1,
                  isFree: true,
                  materials: {
                    create: [
                      {
                        title: 'Slides da Aula 1',
                        type: 'PDF',
                        url: 'https://example.com/slides-1.pdf',
                      },
                      {
                        title: 'Código Exemplo',
                        type: 'LINK',
                        url: 'https://github.com/example/code',
                      },
                    ],
                  },
                },
                {
                  title: 'Variáveis e Tipos de Dados',
                  description: 'Entenda como armazenar informações',
                  content: 'Aprenda sobre variáveis e tipos de dados básicos.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 25,
                  order: 2,
                  isFree: true,
                  materials: {
                    create: [
                      {
                        title: 'Exercícios Práticos',
                        type: 'PDF',
                        url: 'https://example.com/exercises-1.pdf',
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Estruturas de Controle',
            description: 'Condicionais e loops',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'If e Else',
                  description: 'Tomando decisões no código',
                  content: 'Estruturas condicionais permitem que seu programa tome decisões.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 30,
                  order: 1,
                  isFree: true,
                },
                {
                  title: 'Loops e Iterações',
                  description: 'Repetindo tarefas',
                  content: 'Aprenda a repetir ações de forma eficiente.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 35,
                  order: 2,
                  isFree: true,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Curso Gratuito criado: ${freeCourse.id}\n`);

  // ========================================
  // 2. CURSO PAGO SEM DESCONTO
  // ========================================
  console.log('💰 Criando Curso Pago (sem desconto)...');
  const paidCourse = await prisma.course.create({
    data: {
      title: 'JavaScript Moderno - Do Zero ao Avançado',
      slug: 'javascript-moderno-zero-avancado',
      description: 'Domine JavaScript ES6+ com projetos práticos e aplicações reais.',
      thumbnail: TEST_THUMBNAILS.basic,
      price: 197.00,
      originalPrice: 197.00,
      categoryId: category.id,
      teacherId: teacher.id,
      level: 'INTERMEDIATE',
      duration: 600, // 10 horas
      published: true,
      featured: true,
      modules: {
        create: [
          {
            title: 'Módulo 1: JavaScript Moderno',
            description: 'ES6+ Features',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introdução ao JavaScript Moderno',
                  description: 'Visão geral do ES6+',
                  content: 'Conheça as novidades do JavaScript moderno.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 20,
                  order: 1,
                  isFree: true,
                  materials: {
                    create: [
                      {
                        title: 'Guia ES6+',
                        type: 'PDF',
                        url: 'https://example.com/es6-guide.pdf',
                      },
                    ],
                  },
                },
                {
                  title: 'Arrow Functions e Lexical This',
                  description: 'Funções modernas',
                  content: 'Aprenda sobre arrow functions e contexto léxico.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 30,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Destructuring e Spread Operator',
                  description: 'Sintaxe moderna',
                  content: 'Manipule dados de forma elegante.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 35,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Async/Await e Promises',
            description: 'Programação assíncrona',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Entendendo Promises',
                  description: 'Trabalhando com código assíncrono',
                  content: 'Promises são fundamentais no JavaScript moderno.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 40,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Async/Await na Prática',
                  description: 'Sintaxe moderna para assincronismo',
                  content: 'Aprenda a trabalhar com async/await.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 45,
                  order: 2,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 3: Projeto Prático',
            description: 'Aplicação completa',
            order: 3,
            lessons: {
              create: [
                {
                  title: 'Setup do Projeto',
                  description: 'Configurando ambiente',
                  content: 'Prepare seu ambiente de desenvolvimento.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 25,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Consumindo APIs',
                  description: 'Fetch e Axios',
                  content: 'Aprenda a consumir APIs REST.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 50,
                  order: 2,
                  isFree: false,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Curso Pago criado: ${paidCourse.id}\n`);

  // ========================================
  // 3. CURSO COM DESCONTO (34%)
  // ========================================
  console.log('🎯 Criando Curso com Desconto (34%)...');
  const discountCourse = await prisma.course.create({
    data: {
      title: 'React & Next.js - Aplicações Profissionais',
      slug: 'react-nextjs-aplicacoes-profissionais',
      description: 'Desenvolva aplicações web modernas com React e Next.js usando as melhores práticas.',
      thumbnail: TEST_THUMBNAILS.premium,
      price: 297.00,
      originalPrice: 450.00, // Desconto de 34%
      categoryId: category.id,
      teacherId: teacher.id,
      level: 'ADVANCED',
      duration: 900, // 15 horas
      published: true,
      featured: true,
      modules: {
        create: [
          {
            title: 'Módulo 1: Fundamentos do React',
            description: 'Components, Props, State',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introdução ao React',
                  description: 'Por que React?',
                  content: 'Entenda a filosofia por trás do React.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 25,
                  order: 1,
                  isFree: true,
                  materials: {
                    create: [
                      {
                        title: 'Documentação React',
                        type: 'LINK',
                        url: 'https://react.dev',
                      },
                    ],
                  },
                },
                {
                  title: 'JSX e Virtual DOM',
                  description: 'Como o React funciona',
                  content: 'Entenda o JSX e o conceito de Virtual DOM.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 35,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Componentes Funcionais',
                  description: 'Modern React',
                  content: 'Aprenda a criar componentes funcionais.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 40,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Hooks Avançados',
            description: 'useState, useEffect, useContext',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'useState e useEffect',
                  description: 'Hooks essenciais',
                  content: 'Domine os hooks mais importantes do React.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 45,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Context API',
                  description: 'Gerenciamento de estado global',
                  content: 'Compartilhe estado entre componentes.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 50,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Custom Hooks',
                  description: 'Reutilizando lógica',
                  content: 'Crie seus próprios hooks personalizados.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 40,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 3: Next.js Essencial',
            description: 'SSR, SSG, API Routes',
            order: 3,
            lessons: {
              create: [
                {
                  title: 'Introdução ao Next.js',
                  description: 'O framework React',
                  content: 'Conheça o Next.js e suas vantagens.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 30,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'App Router e Server Components',
                  description: 'Next.js 13+',
                  content: 'Entenda o novo App Router.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 55,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Data Fetching Strategies',
                  description: 'SSR, SSG, ISR',
                  content: 'Aprenda as diferentes estratégias de data fetching.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 50,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 4: Projeto Final',
            description: 'Blog completo com Next.js',
            order: 4,
            lessons: {
              create: [
                {
                  title: 'Arquitetura do Projeto',
                  description: 'Planejamento',
                  content: 'Planeje a estrutura do projeto.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 35,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Implementação do Blog',
                  description: 'Codificação',
                  content: 'Desenvolva o blog completo.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 90,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Deploy e Otimização',
                  description: 'Production ready',
                  content: 'Otimize e faça deploy da aplicação.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 45,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Curso com Desconto criado: ${discountCourse.id}\n`);

  // ========================================
  // 4. CURSO PREMIUM COM DESCONTO ALTO (50%)
  // ========================================
  console.log('🌟 Criando Curso Premium (50% OFF)...');
  const premiumCourse = await prisma.course.create({
    data: {
      title: 'Fullstack Master - TypeScript, Node.js, React & DevOps',
      slug: 'fullstack-master-typescript-nodejs-react',
      description: 'Torne-se um desenvolvedor fullstack completo com TypeScript, Node.js, React, PostgreSQL e DevOps.',
      thumbnail: TEST_THUMBNAILS.advanced,
      price: 497.00,
      originalPrice: 997.00, // Desconto de 50%
      categoryId: category.id,
      teacherId: teacher.id,
      level: 'ADVANCED',
      duration: 1800, // 30 horas
      published: true,
      featured: true,
      modules: {
        create: [
          {
            title: 'Módulo 1: TypeScript Avançado',
            description: 'Type-safe development',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introdução ao TypeScript',
                  description: 'Por que TypeScript?',
                  content: 'Entenda os benefícios do TypeScript.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 30,
                  order: 1,
                  isFree: true,
                  materials: {
                    create: [
                      {
                        title: 'TypeScript Handbook',
                        type: 'PDF',
                        url: 'https://example.com/ts-handbook.pdf',
                      },
                      {
                        title: 'Repositório do Curso',
                        type: 'LINK',
                        url: 'https://github.com/example/fullstack-course',
                      },
                    ],
                  },
                },
                {
                  title: 'Tipos Avançados',
                  description: 'Generics, Utility Types',
                  content: 'Domine tipos avançados do TypeScript.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 50,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Decorators e Metadata',
                  description: 'Metaprogramação',
                  content: 'Aprenda sobre decorators e reflexão.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 45,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 2: Node.js & Express',
            description: 'Backend robusto',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Arquitetura REST API',
                  description: 'Design de APIs',
                  content: 'Aprenda a estruturar APIs profissionais.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 55,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Autenticação JWT',
                  description: 'Segurança',
                  content: 'Implemente autenticação segura.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 60,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Middlewares e Error Handling',
                  description: 'Boas práticas',
                  content: 'Organize seu código com middlewares.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 50,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 3: Banco de Dados',
            description: 'PostgreSQL & Prisma',
            order: 3,
            lessons: {
              create: [
                {
                  title: 'PostgreSQL Essencial',
                  description: 'SQL avançado',
                  content: 'Domine queries complexas.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 55,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Prisma ORM',
                  description: 'Type-safe database access',
                  content: 'Trabalhe com banco de dados de forma type-safe.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 65,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Migrations e Seeds',
                  description: 'Database management',
                  content: 'Gerencie seu schema de forma profissional.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 40,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 4: Frontend Avançado',
            description: 'React & Next.js',
            order: 4,
            lessons: {
              create: [
                {
                  title: 'React Performance',
                  description: 'Otimizações',
                  content: 'Otimize suas aplicações React.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 50,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'State Management com Zustand',
                  description: 'Estado global',
                  content: 'Gerencie estado de forma eficiente.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 45,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'TanStack Query',
                  description: 'Data fetching',
                  content: 'Aprenda a trabalhar com React Query.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 55,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 5: Testing',
            description: 'Jest, React Testing Library',
            order: 5,
            lessons: {
              create: [
                {
                  title: 'Unit Tests com Jest',
                  description: 'Testes unitários',
                  content: 'Escreva testes unitários eficazes.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 50,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Integration Tests',
                  description: 'Testes de integração',
                  content: 'Teste a integração entre componentes.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 55,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'E2E com Playwright',
                  description: 'Testes end-to-end',
                  content: 'Automatize testes completos.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 60,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 6: DevOps & Deploy',
            description: 'Docker, CI/CD, Vercel',
            order: 6,
            lessons: {
              create: [
                {
                  title: 'Docker Fundamentals',
                  description: 'Containerização',
                  content: 'Aprenda a containerizar aplicações.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 60,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'GitHub Actions',
                  description: 'CI/CD',
                  content: 'Automatize deployments.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 55,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Deploy em Produção',
                  description: 'Vercel & Railway',
                  content: 'Faça deploy profissional.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 50,
                  order: 3,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Módulo 7: Projeto Final',
            description: 'Aplicação fullstack completa',
            order: 7,
            lessons: {
              create: [
                {
                  title: 'Planejamento do Projeto',
                  description: 'Requirements & Design',
                  content: 'Planeje uma aplicação profissional.',
                  videoUrl: TEST_VIDEOS.lesson2,
                  duration: 45,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Backend Implementation',
                  description: 'API completa',
                  content: 'Desenvolva o backend.',
                  videoUrl: TEST_VIDEOS.lesson3,
                  duration: 120,
                  order: 2,
                  isFree: false,
                },
                {
                  title: 'Frontend Implementation',
                  description: 'UI/UX completo',
                  content: 'Desenvolva o frontend.',
                  videoUrl: TEST_VIDEOS.intro,
                  duration: 120,
                  order: 3,
                  isFree: false,
                },
                {
                  title: 'Testing & Deploy',
                  description: 'Production ready',
                  content: 'Teste e faça deploy.',
                  videoUrl: TEST_VIDEOS.lesson1,
                  duration: 90,
                  order: 4,
                  isFree: false,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Curso Premium criado: ${premiumCourse.id}\n`);

  // ========================================
  // RESUMO
  // ========================================
  console.log('========================================');
  console.log('🎉 CURSOS DE TESTE CRIADOS COM SUCESSO!');
  console.log('========================================\n');

  console.log('📊 Resumo:');
  console.log(`\n1. 🆓 CURSO GRATUITO`);
  console.log(`   ID: ${freeCourse.id}`);
  console.log(`   Título: ${freeCourse.title}`);
  console.log(`   Preço: R$ ${freeCourse.price.toFixed(2)}`);
  console.log(`   Slug: ${freeCourse.slug}`);

  console.log(`\n2. 💰 CURSO PAGO (sem desconto)`);
  console.log(`   ID: ${paidCourse.id}`);
  console.log(`   Título: ${paidCourse.title}`);
  console.log(`   Preço: R$ ${paidCourse.price.toFixed(2)}`);
  console.log(`   Slug: ${paidCourse.slug}`);

  console.log(`\n3. 🎯 CURSO COM DESCONTO (34% OFF)`);
  console.log(`   ID: ${discountCourse.id}`);
  console.log(`   Título: ${discountCourse.title}`);
  console.log(`   Preço: R$ ${discountCourse.price.toFixed(2)} (de R$ ${discountCourse.originalPrice.toFixed(2)})`);
  console.log(`   Economia: R$ ${(discountCourse.originalPrice - discountCourse.price).toFixed(2)}`);
  console.log(`   Slug: ${discountCourse.slug}`);

  console.log(`\n4. 🌟 CURSO PREMIUM (50% OFF)`);
  console.log(`   ID: ${premiumCourse.id}`);
  console.log(`   Título: ${premiumCourse.title}`);
  console.log(`   Preço: R$ ${premiumCourse.price.toFixed(2)} (de R$ ${premiumCourse.originalPrice.toFixed(2)})`);
  console.log(`   Economia: R$ ${(premiumCourse.originalPrice - premiumCourse.price).toFixed(2)}`);
  console.log(`   Slug: ${premiumCourse.slug}`);

  console.log('\n========================================');
  console.log('✅ Para testar os cursos:');
  console.log('   1. Acesse o catálogo público');
  console.log('   2. Faça login como aluno');
  console.log('   3. Navegue pelos cursos criados');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar cursos de teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
