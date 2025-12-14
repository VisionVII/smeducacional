import React from 'react';
import { cn } from '@/lib/utils';

interface Icon3DProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'emerald' | 'red' | 'blue' | 'violet';
  rounded?: 'md' | 'lg' | 'full';
  className?: string;
}

const colorMap: Record<string, string> = {
  primary: 'from-primary/20 to-primary/5 ring-primary/30',
  emerald: 'from-emerald-300/30 to-emerald-300/10 ring-emerald-400/30',
  red: 'from-red-300/30 to-red-300/10 ring-red-400/30',
  blue: 'from-blue-300/30 to-blue-300/10 ring-blue-400/30',
  violet: 'from-violet-300/30 to-violet-300/10 ring-violet-400/30',
};

const sizeMap: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const roundedMap: Record<string, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Icon3D({
  children,
  size = 'md',
  color = 'primary',
  rounded = 'lg',
  className,
}: Icon3DProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br ring-1 shadow-lg shadow-black/10 ring-offset-1 ring-offset-background flex items-center justify-center',
        'backdrop-blur-sm',
        sizeMap[size],
        roundedMap[rounded],
        colorMap[color],
        className
      )}
    >
      <div className="drop-shadow-[0_3px_3px_rgba(0,0,0,0.25)]">{children}</div>
    </div>
  );
}
