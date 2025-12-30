'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TeacherActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Banco de Atividades
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie, organize e distribua atividades para seus alunos.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Minhas Atividades</CardTitle>
            <CardDescription>
              Gerencie todas as atividades criadas para seus cursos
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Atividade
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar atividade..." className="flex-1" />
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
              <TabsTrigger value="published">Publicadas</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade encontrada. Crie uma para começar!</p>
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum rascunho no momento.</p>
              </div>
            </TabsContent>

            <TabsContent value="published" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade publicada ainda.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
