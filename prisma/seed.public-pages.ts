// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pages = [
    {
      slug: '',
      title: 'Página Inicial',
      description: 'Bem-vindo à SM Educacional',
      content: 'Conteúdo da Home',
      isPublished: true,
    },
    {
      slug: 'about',
      title: 'Sobre',
      description: 'Sobre a SM Educacional',
      content: 'Conteúdo da página Sobre',
      isPublished: true,
    },
    {
      slug: 'terms',
      title: 'Termos de Uso',
      description: 'Termos de uso da plataforma',
      content: 'Conteúdo dos Termos de Uso',
      isPublished: true,
    },
    {
      slug: 'privacy',
      title: 'Política de Privacidade',
      description: 'Política de privacidade da plataforma',
      content: 'Conteúdo da Política de Privacidade',
      isPublished: true,
    },
    {
      slug: 'cookies',
      title: 'Política de Cookies',
      description: 'Como usamos cookies',
      content: 'Conteúdo da Política de Cookies',
      isPublished: true,
    },
    {
      slug: 'lgpd',
      title: 'LGPD',
      description: 'Política LGPD',
      content: 'Conteúdo da LGPD',
      isPublished: true,
    },
    {
      slug: 'faq',
      title: 'FAQ',
      description: 'Perguntas frequentes',
      content: 'Conteúdo do FAQ',
      isPublished: true,
    },
    {
      slug: 'contact',
      title: 'Contato',
      description: 'Fale conosco',
      content: 'Conteúdo da página de contato',
      isPublished: true,
    },
    {
      slug: 'help',
      title: 'Central de Ajuda',
      description: 'Ajuda e suporte',
      content: 'Conteúdo da Central de Ajuda',
      isPublished: true,
    },
    {
      slug: 'become-instructor',
      title: 'Torne-se Instrutor',
      description: 'Seja um instrutor na plataforma',
      content: 'Conteúdo para instrutores',
      isPublished: true,
    },
    {
      slug: 'courses',
      title: 'Catálogo de Cursos',
      description: 'Veja todos os cursos disponíveis',
      content: 'Conteúdo do catálogo de cursos',
      isPublished: true,
    },
  ];

  for (const page of pages) {
    await prisma.publicPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
