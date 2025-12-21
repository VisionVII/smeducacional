import { Suspense } from 'react';
import PublicPagesAdmin from '@/components/admin/PublicPagesAdmin';

export default function PublicPagesAdminPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Páginas Públicas</h1>
      <Suspense fallback={<div>Carregando...</div>}>
        <PublicPagesAdmin />
      </Suspense>
    </div>
  );
}
