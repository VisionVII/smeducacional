import { prisma } from '../src/lib/db';

async function main() {
  const pages = [
    {
      slug: 'home',
      title: 'Página Inicial',
      description: 'Página principal da plataforma',
    },
    {
      slug: 'about',
      title: 'Sobre',
      description: 'Sobre a SM Educacional',
    },
    {
      slug: 'courses',
      title: 'Catálogo de Cursos',
      description: 'Todos os cursos disponíveis',
    },
  ];

  for (const page of pages) {
    await prisma.publicPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log('Páginas públicas populadas com sucesso!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
