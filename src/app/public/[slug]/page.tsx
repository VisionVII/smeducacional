import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/components/ui/BlockRenderer';
import { Block } from '@/components/ui/BlockEditor';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';

interface Props {
  params: { slug: string };
}

export default async function PublicPage({ params }: Props) {
  const slug = params.slug;
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    notFound();
  }

  const page = await prisma.publicPage.findFirst({
    where: { slug, isPublished: true },
  });
  if (!page) notFound();

  const blocks: Block[] = Array.isArray(page.content)
    ? (page.content as unknown as Block[])
    : [];
  const markdownContent =
    !Array.isArray(page.content) && typeof page.content === 'string'
      ? page.content
      : '';
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
      {page.description && (
        <div className="text-muted-foreground mb-4">{page.description}</div>
      )}
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} />
      ) : (
        <div className="prose dark:prose-invert">
          <MarkdownEditor source={markdownContent} />
        </div>
      )}
    </div>
  );
}
