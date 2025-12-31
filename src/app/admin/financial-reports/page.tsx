import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Relatório Fiscal - Admin',
  description: 'Relatórios financeiros e fiscais',
};

export default async function AdminFinancialReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold mb-4">Relatório Fiscal</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Relatórios financeiros e fiscais em desenvolvimento. Em breve você
            poderá gerar relatórios de receita, impostos e demonstrativos aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
