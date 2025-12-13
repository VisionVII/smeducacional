'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import {
  generateSecurePassword,
  calculatePasswordStrength,
} from '@/lib/password-utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  showGenerator?: boolean;
  id?: string;
  required?: boolean;
  autoComplete?: 'current-password' | 'new-password';
}

export function PasswordInput({
  value,
  onChange,
  label = 'Senha',
  placeholder = 'Digite sua senha',
  showStrength = true,
  showGenerator = false,
  id = 'password',
  required = true,
  autoComplete = 'new-password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = calculatePasswordStrength(value);
  const progressValue = (strength.score / 5) * 100;

  const handleGenerate = () => {
    const newPassword = generateSecurePassword(16);
    onChange(newPassword);
  };

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showGenerator && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            className="h-auto py-1 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Gerar senha forte
          </Button>
        )}
      </div>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="pr-20"
          autoComplete={autoComplete}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              title="Copiar senha"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="h-8 w-8 p-0"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Força da senha:</span>
            <span className={`font-medium ${strength.color}`}>
              {strength.feedback}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      )}
    </div>
  );
}
