import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { StripeConfigPanel } from '@/components/admin/stripe-config-panel';
import { StripeConfigService } from '@/lib/services/stripe-config.service';

export const metadata = {
  title: 'Configuração Stripe - Admin',
  description: 'Gerenciar configurações e conexões do Stripe',
};

export default async function AdminStripeConfigPage() {
  const session = await auth();

  // Verificar autenticação e autorização
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Buscar status das configurações
  const statuses = await StripeConfigService.getAllConfigStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <StripeConfigPanel initialStatuses={statuses} />
      </div>
    </div>
  );
}
