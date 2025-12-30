'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMaintenanceStatus } from '@/hooks/use-maintenance-status';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';

/**
 * /maintenance page
 * Exibida quando sistema está em modo de manutenção
 * Atualiza em tempo real via SSE
 */

export default function MaintenancePage() {
  const { isMaintenance, estimatedReturn, message, isConnected } =
    useMaintenanceStatus();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!estimatedReturn) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = estimatedReturn.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Retornando em breve...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [estimatedReturn]);

  if (!mounted) {
    return null;
  }

  // Se volta da manutenção, redireciona (hook cuida disso, mas como fallback)
  if (!isMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Voltando à aplicação...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Redirecionando em alguns segundos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-amber-200/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-6 h-6" />
            Sistema em Manutenção
          </CardTitle>
          <CardDescription>Estaremos de volta em breve</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mensagem customizada */}
          {message && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-900">{message}</p>
            </div>
          )}

          {/* Countdown */}
          <div className="bg-slate-100 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-600 mb-2">Retorno estimado em:</p>
            <p className="text-2xl font-mono font-bold text-slate-900">
              {timeLeft || 'Carregando...'}
            </p>
          </div>

          {/* Status da conexão */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-slate-600">
              {isConnected ? 'Monitorando atualizações' : 'Reconectando...'}
            </span>
          </div>

          {/* Informações */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
            <p>
              <strong>O que aconteceu?</strong> Estamos realizando manutenção
              importante para melhorar a plataforma.
            </p>
            <p>
              <strong>Dados seguros?</strong> Sim! Todos os seus dados estão
              protegidos.
            </p>
          </div>

          {/* Call to action */}
          <Link
            href="/"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voltar para home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
