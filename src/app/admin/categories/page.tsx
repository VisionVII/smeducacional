"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  courseCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      return res.json();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar categoria");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsCreating(false);
      setFormData({ name: "", description: "" });
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao atualizar categoria");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingId(null);
      setFormData({ name: "", description: "" });
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir categoria");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategoryMutation.mutate({ id: editingId, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Folder className="h-8 w-8" />
            Gerenciar Categorias
          </h1>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Total de {categories?.length || 0} categorias cadastradas
        </p>
      </div>

      {/* Formulário de Criação/Edição */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Atualize as informações da categoria"
                : "Preencha os dados para criar uma nova categoria"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Ex: Programação, Design, Marketing..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Breve descrição da categoria..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Categorias */}
      {categories && categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira categoria para organizar os cursos
            </p>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories?.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                      disabled={
                        deleteCategoryMutation.isPending ||
                        category.courseCount > 0
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{category.courseCount} curso(s)</span>
                  </div>
                  <div>
                    Criada em {new Date(category.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                {category.courseCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    * Não é possível excluir categorias com cursos vinculados
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
