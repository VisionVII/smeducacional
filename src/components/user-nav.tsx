'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, mounted } = useTranslations();

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getRoleName = (role: string) => {
    if (!mounted || !t.roles) {
      const roles = {
        ADMIN: 'Administrador',
        TEACHER: 'Professor',
        STUDENT: 'Aluno',
      };
      return roles[role as keyof typeof roles] || role;
    }
    return t.roles[role.toLowerCase() as keyof typeof t.roles] || role;
  };

  const getDashboardRoute = () => {
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={session.user.avatar || ''}
              alt={session.user.name || ''}
            />
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {getRoleName(session.user.role)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(getDashboardRoute())}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{mounted ? t.nav.dashboard : 'Dashboard'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/${session.user.role.toLowerCase()}/profile`)
            }
          >
            <User className="mr-2 h-4 w-4" />
            <span>{mounted ? t.nav.profile : 'Perfil'}</span>
          </DropdownMenuItem>
          {session.user.role === 'ADMIN' && (
            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{mounted ? t.nav.settings : 'Configurações'}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{mounted ? t.nav.logout : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
