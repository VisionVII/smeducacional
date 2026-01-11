import type { Metadata, Viewport } from 'next';
import { headers, cookies } from 'next/headers';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { ThemeScript } from '@/components/theme-script';
import { CurrencyProvider } from '@/components/currency-provider';
import { TranslationsProvider } from '@/components/translations-provider';
import { CartProvider } from '@/contexts/cart-context';
import { locales, type Locale } from '@/lib/locales';
import { FloatingLanguageSwitcher } from '@/components/language-switcher';

// Removido next/font/google para evitar fetch em build (Turbopack)

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
        {/* Google Fonts via link (carregado em runtime, sem fetch no build) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        {/* EMERGENCY UNBLOCK: Desbloqueador nuclear de página */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                console.log('[Emergency] Nuclear unblock script loaded');
                
                // FASE 1: Desbloqueie tudo IMEDIATAMENTE
                function nuclearUnblock() {
                  try {
                    console.log('[Emergency] Nuclear deblock started');
                    
                    // 1. Permitir scroll (EXTREMAMENTE defensivo)
                    try {
                      var body = document.body;
                      var docEl = document.documentElement;
                      
                      if (body && body.style) {
                        body.style.overflow = 'auto !important';
                        body.style.pointerEvents = 'auto !important';
                      }
                      if (docEl && docEl.style) {
                        docEl.style.overflow = 'auto !important';
                      }
                    } catch (e1) {
                      console.warn('[Emergency] Failed to set body styles:', e1.message);
                    }
                    
                    // 2. Remover pointer-events-none de TODOS os elementos
                    try {
                      var elements = document.querySelectorAll('[style*="pointer-events"]');
                      if (elements && elements.length > 0) {
                        elements.forEach(function(el) {
                          if (el && el.style) {
                            el.style.pointerEvents = 'auto !important';
                          }
                        });
                      }
                    } catch (e2) {
                      console.warn('[Emergency] Failed to fix pointer-events:', e2.message);
                    }
                    
                    // 3. MATAR todas as divs com z-index alto
                    var killed = 0;
                    try {
                      var zElements = document.querySelectorAll('[class*="z-"], [style*="z-index"]');
                      if (zElements && zElements.length > 0) {
                        zElements.forEach(function(el) {
                          if (!el || !el.style) return;
                          try {
                            var computed = window.getComputedStyle(el);
                            var zIndex = computed ? computed.zIndex : '0';
                            var zVal = parseInt(zIndex);
                            if (zVal > 100) {
                              el.style.display = 'none !important';
                              el.style.visibility = 'hidden !important';
                              el.style.pointerEvents = 'none !important';
                              killed++;
                            }
                          } catch (e3) {}
                        });
                      }
                    } catch (e4) {
                      console.warn('[Emergency] Failed to kill z-index:', e4.message);
                    }
                    if (killed > 0) {
                      console.log('[Emergency] Killed ' + killed + ' high z-index elements');
                    }
                    
                    // 4. Removê LoadingScreen especificamente
                    try {
                      var loading = document.getElementById('loading-screen-root');
                      if (loading && loading.style) {
                        loading.style.display = 'none !important';
                        loading.style.pointerEvents = 'none !important';
                        console.log('[Emergency] Hidden loading-screen-root');
                      }
                    } catch (e5) {
                      console.warn('[Emergency] Failed to hide loading:', e5.message);
                    }
                    
                    // 5. Remover overlays por atributo
                    try {
                      var overlays = document.querySelectorAll('[data-loading-screen], [data-slow-loading]');
                      if (overlays && overlays.length > 0) {
                        overlays.forEach(function(el) {
                          if (el && el.style) {
                            el.style.display = 'none !important';
                            el.style.pointerEvents = 'none !important';
                          }
                        });
                      }
                    } catch (e6) {
                      console.warn('[Emergency] Failed to hide overlays:', e6.message);
                    }
                    
                    // 6. Permitir todos os clicks eventos
                    try {
                      var buttons = document.querySelectorAll('button, a, [role="button"]');
                      if (buttons && buttons.length > 0) {
                        buttons.forEach(function(el) {
                          if (el && el.style) {
                            el.style.pointerEvents = 'auto !important';
                          }
                        });
                      }
                    } catch (e7) {
                      console.warn('[Emergency] Failed to enable clicks:', e7.message);
                    }
                    
                    console.log('[Emergency] Nuclear deblock completed');
                  } catch (errMain) {
                    console.error('[Emergency] Critical error in nuclearUnblock:', errMain);
                  }
                }
                
                // RUN IMMEDIATELY (T=0) - com proteção extra
                try {
                  if (document.readyState !== 'loading') {
                    nuclearUnblock();
                  }
                } catch (e) {
                  console.error('[Emergency] Failed at T=0:', e);
                }
                
                // RUN ON READY (quando DOM está pronto)
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    try {
                      setTimeout(nuclearUnblock, 0);
                    } catch (e) {
                      console.error('[Emergency] Failed at DOMContentLoaded:', e);
                    }
                  });
                }
                
                // RUN ON LOAD (quando tudo carregou)
                window.addEventListener('load', function() {
                  try {
                    setTimeout(nuclearUnblock, 100);
                  } catch (e) {
                    console.error('[Emergency] Failed at load:', e);
                  }
                });
                
                // RUN EVERY 500ms FOR 5 SECONDS (catch late-rendered elements)
                var interval = null;
                try {
                  interval = setInterval(function() {
                    try {
                      nuclearUnblock();
                    } catch (e) {
                      console.warn('[Emergency] Failed in interval:', e.message);
                    }
                  }, 500);
                  setTimeout(function() {
                    if (interval) clearInterval(interval);
                  }, 5000);
                } catch (e) {
                  console.error('[Emergency] Failed to set interval:', e);
                }
                
                // ESC KEY: Force unblock
                try {
                  document.addEventListener('keydown', function(e) {
                    if (e && e.key === 'Escape') {
                      console.log('[Emergency] ESC pressed - nuclear unblock');
                      try {
                        nuclearUnblock();
                      } catch (err) {
                        console.error('[Emergency] Failed on ESC:', err);
                      }
                    }
                  });
                } catch (e) {
                  console.error('[Emergency] Failed to add ESC listener:', e);
                }
                
                console.log('[Emergency] Nuclear unblock ready!');
              })();
            `,
          }}
        />

        {/* SAFETY: Garante que página nunca fica travada */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                // Ensure scroll is never blocked (with null checks)
                if (document.body) {
                  document.body.style.overflow = 'auto';
                }
                if (document.documentElement) {
                  document.documentElement.style.overflow = 'auto';
                }
                
                // Unblock on DOMContentLoaded
                document.addEventListener('DOMContentLoaded', function() {
                  if (document.body) document.body.style.overflow = 'auto';
                  if (document.documentElement) document.documentElement.style.overflow = 'auto';
                });
                
                // Global overlay killer - runs multiple times to catch stragglers
                function removeBlockingOverlays() {
                  var killed = 0;
                  
                  // Target 1: LoadingScreen with ID - MOST AGGRESSIVE
                  var loadingRoot = document.getElementById('loading-screen-root');
                  if (loadingRoot) {
                    // FORCE hide after 3 seconds - no exceptions
                    loadingRoot.style.display = 'none !important';
                    loadingRoot.style.visibility = 'hidden !important';
                    loadingRoot.style.pointerEvents = 'none !important';
                    loadingRoot.setAttribute('data-force-hidden', 'true');
                    killed++;
                  }
                  
                  // Target 2: Any overlay with data-loading-screen
                  var overlays = document.querySelectorAll('[data-loading-screen="true"]');
                  overlays.forEach(function(el) {
                    if (el) {
                      el.style.display = 'none !important';
                      el.style.visibility = 'hidden !important';
                      el.style.pointerEvents = 'none !important';
                      killed++;
                    }
                  });
                  
                  return killed;
                }
                
                // Run immediately (aggressive)
                removeBlockingOverlays();
                
                // Run on load event
                window.addEventListener('load', function() {
                  setTimeout(removeBlockingOverlays, 100);
                });
                
                // Run at 2 second mark (CRITICAL)
                setTimeout(removeBlockingOverlays, 2000);
                
                // Run at 3 second mark (FINAL)
                setTimeout(removeBlockingOverlays, 3000);
                
                // Run periodically for 10 seconds
                var safetyInterval = setInterval(removeBlockingOverlays, 1000);
                setTimeout(function() {
                  clearInterval(safetyInterval);
                }, 10000);
              })();
            `,
          }}
        />
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
        className={`font-sans mobile-safe-area antialiased`}
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
                  <CartProvider>
                    {children}
                    <Toaster />
                    <CookieBanner />
                    <FloatingLanguageSwitcher />
                  </CartProvider>
                </CurrencyProvider>
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
