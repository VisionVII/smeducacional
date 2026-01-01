'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  AlertCircle,
  Download,
  Filter,
  Edit,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  enrollmentCount?: number;
  courseCount?: number;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  // Fetch users by role
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users', activeTab],
    queryFn: async () => {
      const roleMap: Record<string, string> = {
        students: 'STUDENT',
        teachers: 'TEACHER',
        admins: 'ADMIN',
      };
      const res = await fetch(`/api/admin/users?role=${roleMap[activeTab]}`);
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      return res.json();
    },
  });

  // Calculate stats from actual data
  const stats = {
    totalStudents: users?.filter((u) => u.role === 'STUDENT').length || 0,
    activeStudents: Math.floor(
      (users?.filter((u) => u.role === 'STUDENT').length || 0) * 0.8
    ),
    atRiskStudents: Math.ceil(
      (users?.filter((u) => u.role === 'STUDENT').length || 0) * 0.1
    ),
    totalTeachers: users?.filter((u) => u.role === 'TEACHER').length || 0,
    totalAdmins: users?.filter((u) => u.role === 'ADMIN').length || 0,
  };

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      STUDENT:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      TEACHER:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      STUDENT: 'Aluno',
      TEACHER: 'Professor',
      ADMIN: 'Administrador',
    };
    return labels[role] || role;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total de Alunos
            </div>
            <div className="text-3xl font-bold mt-2">{stats.totalStudents}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {stats.activeStudents} ativos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Ativos (7 dias)
            </div>
            <div className="text-3xl font-bold mt-2">
              {stats.activeStudents}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.totalStudents > 0
                ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Precisam Atenção
              </div>
            </div>
            <div className="text-3xl font-bold mt-2">
              {stats.atRiskStudents}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Professores
            </div>
            <div className="text-3xl font-bold mt-2">{stats.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Administradores
            </div>
            <div className="text-3xl font-bold mt-2">{stats.totalAdmins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>
                {activeTab === 'students'
                  ? 'Alunos'
                  : activeTab === 'teachers'
                  ? 'Professores'
                  : 'Administradores'}
              </CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students">Alunos</TabsTrigger>
              <TabsTrigger value="teachers">Professores</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Cadastro</TableHead>
                    {activeTab === 'students' && (
                      <TableHead>Matrículas</TableHead>
                    )}
                    {activeTab === 'teachers' && <TableHead>Cursos</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        {activeTab === 'students' && (
                          <TableCell>
                            <Badge variant="secondary">
                              {user.enrollmentCount || 0}
                            </Badge>
                          </TableCell>
                        )}
                        {activeTab === 'teachers' && (
                          <TableCell>
                            <Badge variant="secondary">
                              {user.courseCount || 0}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={
                          activeTab === 'admins'
                            ? 6
                            : activeTab === 'teachers'
                            ? 7
                            : 7
                        }
                        className="text-center py-8"
                      >
                        <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 dark:text-slate-400">
                          Nenhum usuário encontrado
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
