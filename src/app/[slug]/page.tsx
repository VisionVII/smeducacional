import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { BlockRenderer } from '@/components/ui/BlockRenderer';
import { Block } from '@/components/ui/BlockEditor';

interface PageProps {
  params: { slug: string };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;

  // Validar slug
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    notFound();
  }

  // Buscar página publicada
  const page = await prisma.publicPage.findFirst({
    where: { slug, isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      bannerUrl: true,
      iconUrl: true,
      content: true,
    },
  });

  if (!page) {
    notFound();
  }

  // Converter content para Block[] com validação
  const blocks: Block[] = Array.isArray(page.content)
    ? (page.content as unknown as Block[])
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {page.bannerUrl && (
        <div
          className="relative h-64 md:h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${page.bannerUrl})` }}
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {page.iconUrl && (
                <Image
                  src={page.iconUrl}
                  alt={page.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 mx-auto mb-4"
                />
              )}
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {page.title}
              </h1>
              {page.description && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {!page.bannerUrl && (
          <div className="mb-8 text-center">
            {page.iconUrl && (
              <Image
                src={page.iconUrl}
                alt={page.title}
                width={48}
                height={48}
                className="w-12 h-12 mx-auto mb-4"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
            {page.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {page.description}
              </p>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} />
          ) : (
            <p className="text-center text-muted-foreground">
              Esta página ainda não possui conteúdo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Gerar metadados dinâmicos
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return { title: 'Página não encontrada' };
  }

  const page = await prisma.publicPage.findFirst({
    where: { slug, isPublished: true },
    select: {
      title: true,
      description: true,
      bannerUrl: true,
    },
  });

  if (!page) {
    return {
      title: 'Página não encontrada',
    };
  }

  return {
    title: page.title,
    description: page.description || undefined,
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      images: page.bannerUrl ? [page.bannerUrl] : undefined,
    },
  };
}

// Gerar rotas estáticas em build time (opcional, para melhor performance)
export async function generateStaticParams() {
  const pages = await prisma.publicPage.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });

  return pages.map((page) => ({
    slug: page.slug,
  }));
}
