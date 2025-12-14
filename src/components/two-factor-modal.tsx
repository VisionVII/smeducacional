'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Clock, X } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  title?: string;
  description?: string;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onVerify,
  title = 'Código de Autenticação',
  description = 'Digite o código de 6 dígitos do seu app de autenticação',
}: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsLoading(true);
    try {
      await onVerify(code);
      setCode('');
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-background border rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5" />
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Tempo restante: {countdown}s</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="2fa-code">Código de 6 dígitos</Label>
            <Input
              id="2fa-code"
              inputMode="numeric"
              pattern="\\d{6}"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="flex-1"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verificar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
