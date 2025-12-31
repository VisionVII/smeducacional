'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Search,
  Archive,
  AlertCircle,
  Reply,
  Trash2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  receivedAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['admin-messages', searchTerm, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('filter', filter);

      const res = await fetch(`/api/admin/messages?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar mensagens');
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  const unreadCount = messages?.filter((m) => !m.read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Mensagens</h1>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">{unreadCount} não lidas</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Centro de mensagens e comunicação com usuários
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Centro de mensagens em desenvolvimento. Em breve: conversas, templates
          de resposta e integração com notificações.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por assunto ou remetente..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Não lidas
              </Button>
              <Button
                variant={filter === 'important' ? 'default' : 'outline'}
                onClick={() => setFilter('important')}
              >
                Importantes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Mensagens ({messages?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>De</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Prévia
                    </TableHead>
                    <TableHead className="w-24">Prioridade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={!message.read ? 'bg-secondary/30' : ''}
                    >
                      <TableCell>
                        <div>
                          <p
                            className={
                              message.read ? 'font-normal' : 'font-semibold'
                            }
                          >
                            {message.senderName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.senderEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {message.subject}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground line-clamp-1">
                        {message.preview}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            message.priority === 'high'
                              ? 'destructive'
                              : message.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {message.priority === 'high'
                            ? 'Alta'
                            : message.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Responder"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Arquivar"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma mensagem encontrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
