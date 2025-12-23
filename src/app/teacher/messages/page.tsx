'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Thread {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isOwn: boolean;
}

export default function TeacherMessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: threads, isLoading: threadsLoading } = useQuery<Thread[]>({
    queryKey: ['teacher-threads'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/messages/threads');
      if (!res.ok) throw new Error('Erro ao carregar conversas');
      return res.json();
    },
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['teacher-messages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return [];
      const res = await fetch(
        `/api/teacher/messages/threads/${selectedThreadId}`
      );
      if (!res.ok) throw new Error('Erro ao carregar mensagens');
      return res.json();
    },
    enabled: !!selectedThreadId,
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    try {
      const res = await fetch(
        `/api/teacher/messages/threads/${selectedThreadId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageInput }),
        }
      );

      if (!res.ok) throw new Error('Erro ao enviar mensagem');

      setMessageInput('');
      // Refresh messages
    } catch (error) {
      console.error(error);
    }
  };

  const filteredThreads = threads?.filter((thread) =>
    thread.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {threadsLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : filteredThreads && filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredThreads?.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                      selectedThreadId === thread.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(thread.participantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold truncate">
                              {thread.participantName}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {thread.participantRole}
                            </Badge>
                          </div>
                          {thread.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="rounded-full h-5 min-w-5 px-1.5 ml-2"
                            >
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {thread.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.lastMessageAt).toLocaleString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Área de Mensagens */}
        <Card className="lg:col-span-2 flex flex-col">
          {!selectedThreadId ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(
                        threads?.find((t) => t.id === selectedThreadId)
                          ?.participantName || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {
                    threads?.find((t) => t.id === selectedThreadId)
                      ?.participantName
                  }
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : messages && messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Nenhuma mensagem ainda. Comece a conversa!
                  </div>
                ) : (
                  messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {!message.isOwn && (
                          <p className="text-xs font-semibold mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
