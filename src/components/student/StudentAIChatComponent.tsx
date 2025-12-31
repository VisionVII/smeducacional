'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Componente de Chat IA para Estudantes
 * - Acesso apenas após compra de feature 'ai-assistant'
 * - Responde apenas sobre conteúdo dos cursos matriculados
 * - Deflecta inteligentemente para cursos não matriculados
 */
export function StudentAIChatComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Olá! Sou seu assistente de IA para ajudar com seus cursos. Posso responder dúvidas sobre os conteúdos em que você está matriculado. Como posso ajudar?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Verificar acesso à feature
  useEffect(() => {
    const checkAccess = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        console.log('[StudentAIChat] ⏳ Aguardando autenticação...');
        return;
      }

      console.log(
        '[StudentAIChat] 🔍 Verificando acesso para:',
        session.user.id
      );

      try {
        const response = await fetch('/api/student/ai-chat/access');
        const data = await response.json();

        console.log('[StudentAIChat] 📋 Resposta da API:', {
          ok: response.ok,
          hasAccess: data.hasAccess,
          enrolledCourses: data.enrolledCourses?.length,
          debug: data.debug,
          error: data.error,
        });

        if (response.ok) {
          setHasAccess(data.hasAccess);
          setEnrolledCourses(data.enrolledCourses || []);

          if (data.hasAccess) {
            console.log('[StudentAIChat] ✅ ACESSO CONCEDIDO');
          } else {
            console.log(
              '[StudentAIChat] ❌ ACESSO NEGADO - Motivo:',
              data.debug
            );
          }
        } else {
          console.log('[StudentAIChat] ❌ Erro na resposta:', data.error);
          setHasAccess(false);
        }
      } catch (err) {
        console.error('[StudentAIChat] 💥 Erro ao verificar acesso:', err);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Você precisa estar logado para usar o Chat IA.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-amber-200">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-amber-600" />
            </div>
            <CardTitle>Chat IA - Recurso Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                Você não possui acesso ao Chat IA. Desbloqueie este recurso
                premium agora!
              </p>
              <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 mb-4 text-left">
                <li>✓ Assistente de IA 24/7</li>
                <li>✓ Respostas sobre seus cursos</li>
                <li>✓ Explicações personalizadas</li>
                <li>✓ Ilimitado de perguntas</li>
              </ul>
            </div>
            <p className="text-lg font-bold text-foreground">R$ 29,90</p>
            <Button
              onClick={() => router.push('/checkout/chat-ia')}
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Desbloqueiar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/ai-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          enrolledCourses,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMsg);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${errorMsg}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <div>
              <h1 className="font-bold text-lg">Chat IA</h1>
              <p className="text-xs text-muted-foreground">
                Professor Virtual 24/7
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-md rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    msg.role === 'user'
                      ? 'text-purple-100'
                      : 'text-muted-foreground'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-gray-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {enrolledCourses.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você não está matriculado em nenhum curso ainda. Matricule-se em
                um curso para começar a usar o Chat IA.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Faça uma pergunta sobre seus cursos..."
              className="resize-none"
              rows={3}
              disabled={loading || enrolledCourses.length === 0}
            />
            <Button
              onClick={handleSendMessage}
              disabled={
                loading || !input.trim() || enrolledCourses.length === 0
              }
              className="self-end"
              size="lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            💡 Dica: Faça perguntas específicas sobre o conteúdo dos seus cursos
            matriculados.
          </p>
        </div>
      </div>
    </div>
  );
}
