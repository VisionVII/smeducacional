'use client';

import { ReactNode } from 'react';
import { PublicThemeProvider } from './public-theme-provider';

interface PublicThemeBoundaryProps {
  teacherId?: string;
  children: ReactNode;
}

export function PublicThemeBoundary({
  teacherId,
  children,
}: PublicThemeBoundaryProps) {
  return (
    <PublicThemeProvider teacherId={teacherId}>{children}</PublicThemeProvider>
  );
}
