import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { PublicPage } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PublicPagesDashboard from '@/components/admin/PublicPagesDashboard';

interface Props {
  params: { slug: string };
}

export default async function PublicPagesEditPage({ params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    notFound();
  }
  // A dashboard agora gerencia seleção e edição de páginas, não precisa carregar uma página específica
  return <PublicPagesDashboard />;
}
