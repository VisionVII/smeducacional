import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Configurações - Aluno | SM Educacional',
  description: 'Gerencie suas preferências e configurações',
};

/**
 * Página de configurações para STUDENT
 * Path: /student/settings
 */
export default async function StudentSettingsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência de aprendizado
          </p>
        </div>
      </div>

      {/* Cards de configurações */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Perfil (Futuro) */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Em breve você poderá editar seus dados pessoais, foto de perfil e
              preferências de aprendizado.
            </p>
            <Button disabled variant="secondary">
              Em Breve
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
