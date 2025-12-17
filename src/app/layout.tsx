import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CookieBanner } from '@/components/cookie-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SM Educa - Plataforma Educacional Completa',
  description:
    'Sistema moderno de gestão educacional com cursos, certificados, videoaulas e muito mais',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          storageKey="app-theme-mode"
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <CookieBanner />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
