import type { Metadata, Viewport } from 'next';
import { headers, cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { ThemeScript } from '@/components/theme-script';
import { CurrencyProvider } from '@/components/currency-provider';
import { TranslationsProvider } from '@/components/translations-provider';
import { locales, type Locale } from '@/lib/locales';
import { FloatingLanguageSwitcher } from '@/components/language-switcher';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('preferred-locale')?.value as
    | Locale
    | undefined;

  const headersList = await headers();
  const headerLocale = (() => {
    const accept = headersList.get('accept-language');
    if (!accept) return null;
    const preferred = accept
      .split(',')
      .map((entry) => entry.split(';')[0]?.trim())
      .find((lang) => lang && locales.includes(lang as Locale));
    return preferred ? (preferred as Locale) : null;
  })();

  const initialLocale: Locale = cookieLocale || headerLocale || 'pt-BR';

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Dark mode detection - must use native <script> in head for beforeInteractive */}
        <script
          suppressHydrationWarning
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
          suppressHydrationWarning
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
      <body
        className={`${inter.className} mobile-safe-area antialiased`}
        suppressHydrationWarning
      >
        <TranslationsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            enableColorScheme
            storageKey="app-theme-mode"
          >
            <AuthProvider>
              <QueryProvider>
                <CurrencyProvider>
                  {children}
                  <Toaster />
                  <CookieBanner />
                  <FloatingLanguageSwitcher />
                </CurrencyProvider>
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
