'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Database,
  Shield,
  FunctionSquare,
  Lock,
  FolderOpen,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DatabaseDashboardPage() {
  const [activeTab, setActiveTab] = useState('tables');
  const [searchTerm, setSearchTerm] = useState('');
  const [schemaFilter, setSchemaFilter] = useState('all');
  const [canLoginFilter, setCanLoginFilter] = useState('all');
  const [publicFilter, setPublicFilter] = useState('all');

  // Query para tabelas
  const {
    data: tablesData,
    isLoading: tablesLoading,
    refetch: refetchTables,
  } = useQuery({
    queryKey: ['admin-dev-tables', searchTerm, schemaFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (schemaFilter && schemaFilter !== 'all')
        params.append('schema', schemaFilter);
      const res = await fetch(`/api/admin/dev/database/tables?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar tabelas');
      return res.json();
    },
    enabled: activeTab === 'tables',
  });

  // Query para roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['admin-dev-roles', searchTerm, canLoginFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (canLoginFilter && canLoginFilter !== 'all')
        params.append('canLogin', canLoginFilter);
      const res = await fetch(`/api/admin/dev/database/roles?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar roles');
      return res.json();
    },
    enabled: activeTab === 'roles',
  });

  // Query para functions
  const {
    data: functionsData,
    isLoading: functionsLoading,
    refetch: refetchFunctions,
  } = useQuery({
    queryKey: ['admin-dev-functions', searchTerm, schemaFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (schemaFilter && schemaFilter !== 'all')
        params.append('schema', schemaFilter);
      const res = await fetch(`/api/admin/dev/database/functions?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar funções');
      return res.json();
    },
    enabled: activeTab === 'functions',
  });

  // Query para RLS
  const {
    data: rlsData,
    isLoading: rlsLoading,
    refetch: refetchRls,
  } = useQuery({
    queryKey: ['admin-dev-rls', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`/api/admin/dev/database/rls?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar RLS');
      return res.json();
    },
    enabled: activeTab === 'rls',
  });

  // Query para buckets
  const {
    data: bucketsData,
    isLoading: bucketsLoading,
    refetch: refetchBuckets,
  } = useQuery({
    queryKey: ['admin-dev-buckets', searchTerm, publicFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (publicFilter && publicFilter !== 'all')
        params.append('public', publicFilter);
      const res = await fetch(`/api/admin/dev/database/buckets?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar buckets');
      return res.json();
    },
    enabled: activeTab === 'buckets',
  });

  const handleRefresh = () => {
    switch (activeTab) {
      case 'tables':
        refetchTables();
        break;
      case 'roles':
        refetchRoles();
        break;
      case 'functions':
        refetchFunctions();
        break;
      case 'rls':
        refetchRls();
        break;
      case 'buckets':
        refetchBuckets();
        break;
    }
  };

  useEffect(() => {
    setSearchTerm('');
    setSchemaFilter('all');
    setCanLoginFilter('all');
    setPublicFilter('all');
  }, [activeTab]);

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Banco de Dados</h1>
            <p className="text-muted-foreground">
              Dashboard avançada de desenvolvimento e diagnóstico
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tabelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tablesData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rolesData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FunctionSquare className="h-4 w-4" />
              Funções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {functionsData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              RLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rlsData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Buckets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bucketsData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Explorador de Banco de Dados</CardTitle>
              <CardDescription>
                Visualize e pesquise todos os objetos do banco
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="tables">
                <Database className="h-4 w-4 mr-2" />
                Tabelas
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="functions">
                <FunctionSquare className="h-4 w-4 mr-2" />
                Funções
              </TabsTrigger>
              <TabsTrigger value="rls">
                <Lock className="h-4 w-4 mr-2" />
                RLS
              </TabsTrigger>
              <TabsTrigger value="buckets">
                <FolderOpen className="h-4 w-4 mr-2" />
                Buckets
              </TabsTrigger>
            </TabsList>

            {/* Filtros */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {(activeTab === 'tables' || activeTab === 'functions') && (
                <div>
                  <Label htmlFor="schema">Schema</Label>
                  <Select value={schemaFilter} onValueChange={setSchemaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os schemas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {(activeTab === 'tables'
                        ? tablesData?.schemas
                        : functionsData?.schemas
                      )?.filter((schema: string) => schema).map((schema: string) => (
                        <SelectItem key={schema} value={schema}>
                          {schema}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === 'roles' && (
                <div>
                  <Label htmlFor="canLogin">Tipo</Label>
                  <Select
                    value={canLoginFilter}
                    onValueChange={setCanLoginFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Com Login</SelectItem>
                      <SelectItem value="false">Sem Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === 'buckets' && (
                <div>
                  <Label htmlFor="public">Visibilidade</Label>
                  <Select value={publicFilter} onValueChange={setPublicFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Públicos</SelectItem>
                      <SelectItem value="false">Privados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Tabelas */}
            <TabsContent value="tables" className="mt-0">
              {tablesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Schema</th>
                        <th className="text-left p-3 font-medium">Tabela</th>
                        <th className="text-left p-3 font-medium">Colunas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablesData?.data?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhuma tabela encontrada
                          </td>
                        </tr>
                      ) : (
                        tablesData?.data?.map((table: any) => (
                          <tr
                            key={`${table.table_schema}.${table.table_name}`}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-3">
                              <Badge variant="outline">
                                {table.table_schema}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono">
                              {table.table_name}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {table.column_count} colunas
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Roles */}
            <TabsContent value="roles" className="mt-0">
              {rolesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Role</th>
                        <th className="text-center p-3 font-medium">
                          Superuser
                        </th>
                        <th className="text-center p-3 font-medium">
                          Create DB
                        </th>
                        <th className="text-center p-3 font-medium">
                          Create Role
                        </th>
                        <th className="text-center p-3 font-medium">Login</th>
                        <th className="text-left p-3 font-medium">
                          Conn Limit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesData?.data?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhum role encontrado
                          </td>
                        </tr>
                      ) : (
                        rolesData?.data?.map((role: any) => (
                          <tr
                            key={role.rolname}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-3 font-mono">{role.rolname}</td>
                            <td className="p-3 text-center">
                              {role.rolsuper ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {role.rolcreatedb ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {role.rolcreaterole ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {role.rolcanlogin ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {role.rolconnlimit === -1
                                ? 'Ilimitado'
                                : role.rolconnlimit}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Functions */}
            <TabsContent value="functions" className="mt-0">
              {functionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Schema</th>
                        <th className="text-left p-3 font-medium">Função</th>
                        <th className="text-left p-3 font-medium">
                          Argumentos
                        </th>
                        <th className="text-left p-3 font-medium">Retorno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {functionsData?.data?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhuma função encontrada
                          </td>
                        </tr>
                      ) : (
                        functionsData?.data?.map((func: any) => (
                          <tr
                            key={`${func.schema}.${func.name}`}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-3">
                              <Badge variant="outline">{func.schema}</Badge>
                            </td>
                            <td className="p-3 font-mono">{func.name}</td>
                            <td className="p-3 text-xs text-muted-foreground font-mono max-w-xs truncate">
                              {func.arguments || '()'}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground font-mono">
                              {func.return_type}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* RLS */}
            <TabsContent value="rls" className="mt-0">
              {rlsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Schema</th>
                          <th className="text-left p-3 font-medium">Tabela</th>
                          <th className="text-center p-3 font-medium">
                            RLS Ativo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rlsData?.data?.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Nenhuma tabela com RLS encontrada
                            </td>
                          </tr>
                        ) : (
                          rlsData?.data?.map((table: any) => (
                            <tr
                              key={`${table.schema}.${table.name}`}
                              className="border-t hover:bg-muted/30"
                            >
                              <td className="p-3">
                                <Badge variant="outline">{table.schema}</Badge>
                              </td>
                              <td className="p-3 font-mono">{table.name}</td>
                              <td className="p-3 text-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {rlsData?.policies && rlsData.policies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Políticas RLS
                        </CardTitle>
                        <CardDescription>
                          {rlsData.policies.length} políticas configuradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {rlsData.policies.map((policy: any, idx: number) => (
                            <div
                              key={idx}
                              className="border rounded-md p-3 text-sm"
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-mono font-medium">
                                  {policy.policyname}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {policy.cmd}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {policy.schemaname}.{policy.tablename} •{' '}
                                {policy.permissive
                                  ? 'Permissive'
                                  : 'Restrictive'}{' '}
                                • Roles: {policy.roles?.join(', ') || 'public'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Buckets */}
            <TabsContent value="buckets" className="mt-0">
              {bucketsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-center p-3 font-medium">
                          Visibilidade
                        </th>
                        <th className="text-left p-3 font-medium">
                          Limite de Tamanho
                        </th>
                        <th className="text-left p-3 font-medium">
                          MIME Types
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bucketsData?.data?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhum bucket encontrado
                          </td>
                        </tr>
                      ) : (
                        bucketsData?.data?.map((bucket: any) => (
                          <tr
                            key={bucket.id}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-3 font-mono text-xs text-muted-foreground">
                              {bucket.id}
                            </td>
                            <td className="p-3 font-medium">{bucket.name}</td>
                            <td className="p-3 text-center">
                              <Badge
                                variant={
                                  bucket.public ? 'default' : 'secondary'
                                }
                              >
                                {bucket.public ? 'Público' : 'Privado'}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {bucket.file_size_limit
                                ? `${(
                                    bucket.file_size_limit /
                                    1024 /
                                    1024
                                  ).toFixed(0)} MB`
                                : 'Sem limite'}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                              {bucket.allowed_mime_types?.join(', ') || 'Todos'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
