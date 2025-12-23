import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { ThemeScript } from '@/components/theme-script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SM Educa - Plataforma Educacional Completa',
  description:
    'Sistema moderno de gestão educacional com cursos, certificados, videoaulas e muito mais',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SM Educa',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'SM Educa - Plataforma Educacional',
    description: 'Sistema moderno de gestão educacional',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Dark mode detection (next-themes) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('app-theme-mode') || 'system';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const effectiveTheme = theme === 'system' ? systemTheme : theme;
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Theme colors SSR (ZERO FOUC) */}
        <ThemeScript />
        {/* Preload logo e favicon para carregamento instantâneo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const cached = localStorage.getItem('system-branding-cache');
                  if (cached) {
                    const { logoUrl, faviconUrl } = JSON.parse(cached);
                    if (logoUrl) {
                      const link = document.createElement('link');
                      link.rel = 'preload';
                      link.as = 'image';
                      link.href = logoUrl;
                      document.head.appendChild(link);
                    }
                    if (faviconUrl) {
                      const favicon = document.querySelector('link[rel="icon"]');
                      if (favicon) {
                        favicon.setAttribute('href', faviconUrl);
                      } else {
                        const link = document.createElement('link');
                        link.rel = 'icon';
                        link.href = faviconUrl;
                        document.head.appendChild(link);
                      }
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} mobile-safe-area antialiased`}>
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
