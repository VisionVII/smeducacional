'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Info } from 'lucide-react';
import Link from 'next/link';

export default function ThemeCustomizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Card */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[200px]"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/80 to-primary rounded-2xl shadow-xl">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Personalização de Tema
                </h1>
                <p className="text-muted-foreground mt-1">
                  Sistema de Temas V2.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Sistema de Temas Migrado</CardTitle>
            </div>
            <CardDescription>
              A personalização de temas foi movida para as configurações do
              sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Com o novo Sistema Hierárquico de Temas V2.0, os temas agora
              seguem esta estrutura:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>
                <strong>Admin:</strong> Controla o tema global (rotas públicas +
                área administrativa)
              </li>
              <li>
                <strong>Professor:</strong> Suas rotas privadas herdam
                automaticamente o tema admin
              </li>
              <li>
                <strong>Aluno:</strong> Suas rotas privadas herdam
                automaticamente o tema admin
              </li>
            </ul>
            <div className="pt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Link href="/teacher/dashboard">Voltar ao Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
