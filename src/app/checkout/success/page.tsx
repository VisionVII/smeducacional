'use client';

import { Suspense, useEffect, useState } from 'react';
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

  const type = searchParams.get('type');
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    // Simular processamento
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleRedirect = () => {
    if (type === 'course_purchase' && courseId) {
      router.push(`/student/courses/${courseId}`);
    } else if (type === 'student_subscription') {
      router.push('/student/dashboard');
    } else if (type === 'teacher_subscription') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/');
    }
  };

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

  // ...

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-700">
            Pagamento confirmado!
          </CardTitle>
          <CardDescription>
            Sua transação foi processada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {type === 'course_purchase' && 'Você agora tem acesso ao curso!'}
            {type === 'student_subscription' && 'Sua subscrição foi ativada!'}
            {type === 'teacher_subscription' && 'Seu plano foi ativado!'}
          </p>
          <Button onClick={handleRedirect} className="w-full">
            Continuar
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
