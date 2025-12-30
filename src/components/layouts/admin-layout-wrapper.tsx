'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

type AdminLayoutWrapperProps = {
  user: {
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
};

export function AdminLayoutWrapper({
  user,
  children,
}: AdminLayoutWrapperProps) {
  const { data: session } = useSession();

  // Admins sempre têm acesso a todas as features
  const checkFeatureAccessAction = (featureId: string) => true;

  return (
    <DashboardShell
      role="ADMIN"
      user={{
        name: user.name || user.email,
        email: user.email,
        avatar: user.avatar,
      }}
      onLogoutAction={() => signOut({ callbackUrl: '/login' })}
      checkFeatureAccessAction={checkFeatureAccessAction}
    >
      {children}
    </DashboardShell>
  );
}
