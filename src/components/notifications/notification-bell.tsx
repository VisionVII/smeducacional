'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, X, Check, Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Buscar contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error);
    }
  }, []);

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=10');
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
  }, [toast]);

  // Buscar notificações ao abrir
  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Buscar contagem de não lidas periodicamente
  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, status: 'READ', isRead: true } : n
          )
        );
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar como lida',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: 'READ', isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar todos como lido:', error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao arquivar:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SECURITY_ALERT':
        return '🔒';
      case 'NEW_ENROLLMENT':
        return '📚';
      case 'PAYOUT_READY':
        return '💰';
      case 'COURSE_PURCHASED':
        return '🎁';
      case 'CERTIFICATE_EARNED':
        return '🏆';
      case 'LESSON_AVAILABLE':
        return '✨';
      default:
        return '📬';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 max-h-96 overflow-y-auto p-0"
      >
        {/* Header */}
        <div className="sticky top-0 border-b bg-white dark:bg-gray-950 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notificações</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Marcar tudo como lido
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                  !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
                )}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString(
                        'pt-BR',
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(notification.id)}
                      title="Arquivar"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      title="Deletar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Link */}
                {notification.actionUrl && (
                  <div className="mt-2">
                    <a
                      href={notification.actionUrl}
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Ver detalhes →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white dark:bg-gray-950 p-4">
          <Link
            href="/notifications"
            className="text-sm text-blue-600 hover:underline block text-center"
            onClick={() => setIsOpen(false)}
          >
            Ver todas as notificações
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
