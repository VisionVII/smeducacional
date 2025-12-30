'use client';

import { useSystemBranding } from '@/hooks/use-system-branding';
import Image from 'next/image';
import { GraduationCap, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  show: boolean;
  message?: string;
}

export function LoadingScreen({
  show,
  message = 'Carregando...',
}: LoadingScreenProps) {
  const { branding } = useSystemBranding();

  if (!show) return null;

  const primaryColor = branding?.primaryColor || '#3B82F6';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Background com gradiente divertido */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-90"
        style={{
          backgroundImage: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}40 50%, ${primaryColor}20 100%)`,
        }}
      />

      {/* Padrão animado de fundo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)] animate-pulse" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6">
        {/* Glass Card */}
        <div
          className="rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl p-8 md:p-12 flex flex-col items-center gap-6 max-w-md w-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.1)`,
          }}
        >
          {/* Logo ou Ícone */}
          <div className="relative">
            {branding?.logoUrl ? (
              <div
                className="relative h-16 w-16 flex items-center justify-center rounded-full p-2 backdrop-blur-md border border-white/20"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Image
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  width={60}
                  height={60}
                  className="h-full w-auto object-contain filter brightness-0 invert"
                />
              </div>
            ) : (
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            )}

            {/* Animated pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                border: `2px solid ${primaryColor}30`,
              }}
            />
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {message}
            </h2>
            <p className="text-sm text-white/70">
              Preparando o melhor para você...
            </p>
          </div>

          {/* Spinner */}
          <div className="flex gap-2 justify-center py-2">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>

          {/* Progress bar com gradiente */}
          <div className="w-full h-1.5 rounded-full overflow-hidden backdrop-blur bg-white/10 border border-white/20">
            <div
              className="h-full rounded-full animate-pulse"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}40)`,
                width: '40%',
              }}
            />
          </div>
        </div>

        {/* Floating elements */}
        <div
          className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor, animationDelay: '1s' }}
        />
      </div>
    </div>
  );
}
