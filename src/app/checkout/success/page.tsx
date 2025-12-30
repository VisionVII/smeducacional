'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const type = searchParams.get('type');
  const courseId = searchParams.get('courseId');
  const sessionIdParam = searchParams.get('session_id');

  const confirmWithSessionId = async (sid: string) => {
    const res = await fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Falha ao confirmar pagamento');
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        if (type === 'course_purchase') {
          if (sessionIdParam && sessionIdParam !== '{CHECKOUT_SESSION_ID}') {
            await confirmWithSessionId(sessionIdParam);
          } else if (courseId) {
            const r = await fetch(
              `/api/checkout/session-id?courseId=${courseId}`
            );
            if (r.ok) {
              const j = await r.json();
              const sid = j?.data?.sessionId as string | undefined;
              if (sid) {
                await confirmWithSessionId(sid);
              } else {
                throw new Error('Sessão não localizada para confirmar');
              }
            } else {
              const j = await r.json().catch(() => null);
              throw new Error(
                j?.error || 'Não foi possível localizar a sessão'
              );
            }
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao confirmar pagamento';
        console.error('[Checkout/Success] Erro:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [type, courseId, sessionIdParam]);

  const handleRedirect = useCallback(() => {
    if (type === 'course_purchase') {
      router.push('/student/courses');
      return;
    }
    if (type === 'feature_purchase') {
      const featureId = searchParams.get('featureId');
      if (featureId === 'ai-assistant') {
        router.push('/student/ai-chat');
      } else {
        router.push('/student/dashboard');
      }
      return;
    }
    if (type === 'student_subscription') {
      router.push('/student/dashboard');
      return;
    }
    if (type === 'teacher_subscription') {
      router.push('/teacher/dashboard');
      return;
    }
    router.push('/');
  }, [type, router, searchParams]);

  useEffect(() => {
    if (!loading && !error) {
      const t = setTimeout(() => handleRedirect(), 2000);
      return () => clearTimeout(t);
    }
  }, [loading, error, handleRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processando pagamento...</CardTitle>
            <CardDescription>Por favor, aguarde</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className={error ? 'text-red-600' : 'text-green-700'}>
            {error ? 'Ação necessária' : 'Pagamento confirmado!'}
          </CardTitle>
          <CardDescription>
            {error
              ? 'Pagamento recebido, mas houve falha ao liberar o acesso.'
              : 'Sua transação foi processada com sucesso. Redirecionando para Meus Cursos...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {error ? (
            <p className="text-sm text-destructive font-medium">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {type === 'course_purchase' &&
                'Acesso liberado. Indo para Meus Cursos...'}
              {type === 'student_subscription' &&
                'Subscrição ativada. Redirecionando...'}
              {type === 'teacher_subscription' &&
                'Plano ativado. Redirecionando...'}
            </p>
          )}
          <Button onClick={handleRedirect} className="w-full">
            {error ? 'Ir para Meus Cursos' : 'Clique se não redirecionar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Carregando...</CardTitle>
              <CardDescription>Por favor, aguarde</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
