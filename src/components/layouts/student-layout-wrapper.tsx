'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

type StudentLayoutWrapperProps = {
  user: {
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
};

export function StudentLayoutWrapper({
  user,
  children,
}: StudentLayoutWrapperProps) {
  const { data: session } = useSession();

  // Placeholder: Feature access validation
  // TODO: Integrate with PlanService to check user's plan tier
  const checkFeatureAccessAction = (featureId: string) => {
    // For now, return false for all premium features
    // This will redirect to /checkout when accessing premium routes
    return false;
  };

  return (
    <DashboardShell
      role="STUDENT"
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
