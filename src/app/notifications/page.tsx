'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Archive, Trash2, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const pageSize = 20;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
      });

      if (activeTab !== 'all') {
        params.set('status', activeTab.toUpperCase());
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notificações',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, activeTab, page, toast]);

  useEffect(() => {
    void fetchNotifications();
  }, [activeTab, page, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, status: 'READ', isRead: true } : n
          )
        );
        toast({
          title: 'Sucesso',
          description: 'Notificação marcada como lida',
        });
      }
    } catch (error: unknown) {
      // Error handling já feito acima
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({
          title: 'Sucesso',
          description: 'Notificação arquivada',
        });
      }
    } catch (error: unknown) {
      // Error handling já feito acima
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({
          title: 'Sucesso',
          description: 'Notificação deletada',
        });
      }
    } catch (error: unknown) {
      // Error handling já feito acima
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      SECURITY_ALERT: '🔒',
      USER_REPORTED: '🚩',
      PAYMENT_ISSUE: '⚠️',
      NEW_ENROLLMENT: '📚',
      COURSE_REVIEW: '⭐',
      PAYOUT_READY: '💰',
      LESSON_COMPLETED_BY_STUDENT: '✅',
      COURSE_PURCHASED: '🎁',
      CERTIFICATE_EARNED: '🏆',
      LESSON_AVAILABLE: '✨',
      COURSE_UPDATE: '📝',
      REMINDER_INCOMPLETE_COURSE: '⏰',
    };
    return icons[type] || '📬';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      SECURITY_ALERT: 'Alerta de Segurança',
      USER_REPORTED: 'Usuário Reportado',
      PAYMENT_ISSUE: 'Problema de Pagamento',
      NEW_ENROLLMENT: 'Nova Inscrição',
      COURSE_REVIEW: 'Review do Curso',
      PAYOUT_READY: 'Pagamento Pronto',
      LESSON_COMPLETED_BY_STUDENT: 'Aula Completada',
      COURSE_PURCHASED: 'Curso Comprado',
      CERTIFICATE_EARNED: 'Certificado Conquistado',
      LESSON_AVAILABLE: 'Aula Disponível',
      COURSE_UPDATE: 'Atualização do Curso',
      REMINDER_INCOMPLETE_COURSE: 'Lembrete de Curso',
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie todas as suas notificações em um só lugar
        </p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">Não Lidas</TabsTrigger>
          <TabsTrigger value="read">Lidas</TabsTrigger>
          <TabsTrigger value="archived">Arquivadas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma notificação</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    'hover:shadow-md transition-shadow',
                    !notification.isRead &&
                      'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-4xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {notification.title}
                              </h3>
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {getTypeLabel(notification.type)}
                              </span>
                              {!notification.isRead && (
                                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500 mt-3">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchive(notification.id)}
                              title="Arquivar"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              title="Deletar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Action Link */}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="inline-block mt-4 text-blue-600 hover:underline font-medium text-sm"
                          >
                            Ver detalhes →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={notifications.length < pageSize}
                >
                  Próximo →
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
