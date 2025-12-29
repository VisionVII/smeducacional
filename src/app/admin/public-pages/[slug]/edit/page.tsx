import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import PublicPagesDashboard from '@/components/admin/PublicPagesDashboard';

export default async function PublicPagesEditPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    notFound();
  }
  // A dashboard agora gerencia seleção e edição de páginas, não precisa carregar uma página específica
  return <PublicPagesDashboard />;
}
