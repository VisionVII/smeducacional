/**
 * Script para criar página "Sobre" com conteúdo institucional da SM Educa
 * Execute: node scripts/create-about-page.js
 */

const aboutPageData = {
  slug: 'sobre',
  title: 'SM Educa: Plataforma Completa de Gestão de Aprendizagem e E-learning',
  description:
    'A SM Educa é uma solução de vanguarda em EdTech, desenvolvida para transformar a experiência de ensino-aprendizagem.',
  bannerUrl:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop',
  iconUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=64&h=64&fit=crop',
  isPublished: true,
  content: [
    {
      id: crypto.randomUUID(),
      type: 'text',
      value: `## O que é a SM Educa?

A SM Educa é um **ecossistema digital** que centraliza a criação, hospedagem e venda de cursos online. Ela atua como um braço tecnológico para educadores que precisam de uma infraestrutura profissional sem a complexidade de desenvolvimento técnico.`,
    },
    {
      id: crypto.randomUUID(),
      type: 'section',
      title: 'Nossa Missão',
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          value: `Transformar a experiência de ensino-aprendizagem através de tecnologia de ponta, oferecendo uma plataforma que:

- 📚 **Simplifica** a criação e gestão de cursos
- 🚀 **Potencializa** o alcance de educadores
- 💡 **Inova** na experiência do aluno
- 📊 **Otimiza** processos administrativos`,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'section',
      title: 'Para Quem é a SM Educa?',
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'list',
          ordered: false,
          items: [
            '👨‍🏫 **Professores Autônomos** - Crie e venda seus cursos com autonomia total',
            '🏫 **Instituições de Ensino** - Gerencie múltiplos cursos e alunos em escala',
            '🎓 **Especialistas** - Compartilhe seu conhecimento de forma profissional',
            '💼 **Empresas** - Treinamento e capacitação de equipes',
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'section',
      title: 'Principais Funcionalidades',
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          value: `### Para Professores
- 📝 Criação intuitiva de cursos e módulos
- 🎥 Upload de vídeos, PDFs e materiais diversos
- 📊 Dashboard com analytics em tempo real
- 💰 Gestão de pagamentos integrada (Stripe)
- 📜 Geração automática de certificados

### Para Alunos
- 🎯 Experiência de aprendizado otimizada
- 📱 Acesso multiplataforma (web, mobile)
- ⏯️ Player de vídeo com tracking de progresso
- 📝 Atividades e avaliações interativas
- 🏆 Certificados personalizados

### Para Administradores
- 👥 Gestão completa de usuários
- 📚 Controle total de cursos e conteúdos
- 💳 Relatórios financeiros detalhados
- 📈 Analytics e métricas de performance
- ⚙️ Personalização de temas e branding`,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'section',
      title: 'Tecnologia de Ponta',
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          value: `Construída com as melhores tecnologias do mercado:

- ⚡ **Next.js 16** com Turbopack para performance máxima
- 🔐 **NextAuth.js** para autenticação segura com RBAC
- 🗄️ **PostgreSQL + Prisma** para gestão robusta de dados
- 💳 **Stripe** para processamento de pagamentos
- 📦 **Supabase Storage** para hospedagem de mídia
- 🎨 **Tailwind CSS + Shadcn/UI** para interface moderna`,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'button',
      label: 'Começar Agora',
      url: '/register',
      variant: 'default',
    },
    {
      id: crypto.randomUUID(),
      type: 'button',
      label: 'Ver Catálogo de Cursos',
      url: '/courses',
      variant: 'outline',
    },
  ],
};

async function createAboutPage() {
  try {
    console.log('🚀 Criando página "Sobre"...\n');

    const response = await fetch('http://localhost:3000/api/admin/public-pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aboutPageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar página');
    }

    const result = await response.json();
    console.log('✅ Página criada com sucesso!\n');
    console.log('📄 Detalhes:');
    console.log(`   ID: ${result.data.id}`);
    console.log(`   Slug: ${result.data.slug}`);
    console.log(`   Título: ${result.data.title}`);
    console.log(`   Status: ${result.data.isPublished ? 'Publicada ✓' : 'Rascunho'}`);
    console.log(`   URL: http://localhost:3000/${result.data.slug}`);
    console.log(`   Admin: http://localhost:3000/admin/public-pages\n`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAboutPage();
