'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Digite um email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          code: data.code, // Apenas em dev mode
        });
        setStep('verify');
        toast({
          title: 'Sucesso! ✅',
          description: data.message,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao enviar código',
        });
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao enviar código',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult({
        success: false,
        message: 'Erro de conexão',
      });
      toast({
        title: 'Erro',
        description: 'Erro de conexão com o servidor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast({
        title: 'Erro',
        description: 'Digite o código recebido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Código válido! ✅',
          description: data.message,
        });
        setResult({
          success: true,
          message: 'Código verificado com sucesso!',
          verified: true,
        });
      } else {
        toast({
          title: 'Código inválido',
          description: data.error || 'Código incorreto ou expirado',
          variant: 'destructive',
        });
        setResult({
          success: false,
          message: data.error || 'Código incorreto',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar código',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setEmail('');
    setCode('');
    setStep('send');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🧪 Teste de Email - Resend
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Teste o sistema de envio de emails de recuperação de senha
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
            <CardDescription>Informações sobre o ambiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">RESEND_API_KEY</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    process.env.NEXT_PUBLIC_SUPABASE_URL
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? 'Configurada'
                    : 'Não configurada'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Modo</span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                  Desenvolvimento
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {step === 'send' ? 'Enviar Código' : 'Verificar Código'}
            </CardTitle>
            <CardDescription>
              {step === 'send'
                ? 'Digite um email cadastrado no sistema para receber o código'
                : 'Digite o código de 6 dígitos recebido no email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'send' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <p className="text-xs text-gray-500">
                    Use um email cadastrado no sistema (ex: aluno@teste.com)
                  </p>
                </div>

                <Button
                  onClick={handleSendCode}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Código
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    Código de 6 dígitos enviado para {email}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyCode}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar Código'
                    )}
                  </Button>
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Novo Teste
                  </Button>
                </div>
              </>
            )}

            {result && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  result.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        result.success
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {result.success ? 'Sucesso!' : 'Erro'}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        result.success
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.code && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          CÓDIGO (DEV MODE)
                        </p>
                        <p className="text-2xl font-mono font-bold tracking-widest">
                          {result.code}
                        </p>
                      </div>
                    )}
                    {result.verified && (
                      <p className="text-sm mt-2 text-green-600 dark:text-green-400 font-medium">
                        ✓ Código válido! Agora você pode redefinir a senha.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-2">📝 Notas Importantes:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use um email cadastrado no sistema para testar</li>
            <li>• Em modo dev, o código aparece no console do servidor</li>
            <li>• Em produção, o email será enviado via Resend</li>
            <li>• Códigos expiram em 15 minutos</li>
            <li>• Cada novo código invalida o anterior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
