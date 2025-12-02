"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
}

export default function StudentNotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["student-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/student/notifications");
      if (!res.ok) throw new Error("Erro ao carregar notificações");
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/student/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Erro ao marcar como lida");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/student/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Erro ao marcar todas como lidas");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/student/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir notificação");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      toast({
        title: "Sucesso",
        description: "Notificação excluída.",
      });
    },
  });

  const getTypeBadge = (type: Notification["type"]) => {
    const variants = {
      INFO: { label: "Info", variant: "default" as const },
      SUCCESS: { label: "Sucesso", variant: "secondary" as const },
      WARNING: { label: "Aviso", variant: "default" as const },
      ERROR: { label: "Erro", variant: "destructive" as const },
    };
    const { label, variant } = variants[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
            <Bell className="h-8 w-8" />
            Notificações
          </h1>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              variant="outline"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          {unreadCount > 0
            ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${
                unreadCount > 1 ? "s" : ""
              }`
            : "Todas as notificações foram lidas"}
        </p>
      </div>

      {notifications && notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
            <p className="text-muted-foreground text-center">
              Você não tem notificações no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${
                !notification.isRead ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {getTypeBadge(notification.type)}
                      {!notification.isRead && (
                        <Badge variant="outline" className="bg-primary/10">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
