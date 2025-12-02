"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, Mail, Trash2, Edit, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  enrollmentCount?: number;
  courseCount?: number;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      return res.json();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir usuário");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    },
  });

  const getRoleBadge = (role: User["role"]) => {
    const variants = {
      ADMIN: { label: "Admin", variant: "destructive" as const },
      TEACHER: { label: "Professor", variant: "default" as const },
      STUDENT: { label: "Aluno", variant: "secondary" as const },
    };
    const { label, variant } = variants[role];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciar Usuários
          </h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
        <p className="text-muted-foreground">
          Total de {users?.length || 0} usuários cadastrados
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "STUDENT", "TEACHER", "ADMIN"].map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  onClick={() => setRoleFilter(role)}
                  size="sm"
                >
                  {role === "ALL"
                    ? "Todos"
                    : role === "STUDENT"
                    ? "Alunos"
                    : role === "TEACHER"
                    ? "Professores"
                    : "Admins"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      {filteredUsers && filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros ou adicionar um novo usuário
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers?.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{user.name}</CardTitle>
                        {getRoleBadge(user.role)}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cadastro: </span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {user.role === "STUDENT" && user.enrollmentCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Matrículas: </span>
                      <span className="font-medium">{user.enrollmentCount}</span>
                    </div>
                  )}
                  {user.role === "TEACHER" && user.courseCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Cursos: </span>
                      <span className="font-medium">{user.courseCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
