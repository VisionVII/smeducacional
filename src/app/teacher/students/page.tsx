'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TeacherStudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gestão de Alunos
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie seus alunos matriculados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alunos Matriculados</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os alunos em seus cursos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar aluno..." className="flex-1" />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  Nenhum aluno encontrado. Faça login nos seus cursos para
                  vê-los aqui.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum aluno ativo no momento.</p>
              </div>
            </TabsContent>

            <TabsContent value="inactive" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum aluno inativo.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
