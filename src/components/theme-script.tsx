/**
 * ============================================
 * THEME SCRIPT - INLINE CSS INJECTION (SSR)
 * ============================================
 *
 * Script injetado no <head> para aplicar tema ANTES do React hidratar.
 * Zero FOUC (Flash of Unstyled Content).
 *
 * LÓGICA HIERÁRQUICA:
 * - Rotas públicas (/, /courses, /login) → Tema ADMIN
 * - Rotas admin (/admin/*) → Tema ADMIN
 * - Rotas teacher/student → Tema USUÁRIO (com fallback ao ADMIN)
 *
 * IMPORTANTE: Este é um Server Component que gera um <script> inline.
 */

import { auth } from '@/lib/auth';
import { getUserTheme } from '@/lib/themes/get-user-theme';
import { getAdminTheme } from '@/lib/themes/get-admin-theme';
import { generateCssVariables } from '@/lib/themes/presets';
import { headers } from 'next/headers';

/**
 * Define se rota deve usar tema admin (hierarquia)
 */
function shouldUseAdminTheme(pathname: string): boolean {
  // Rotas públicas sempre usam tema admin
  const publicRoutes = ['/', '/courses', '/login', '/register', '/about'];
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
  ) {
    return true;
  }

  // Admin sempre usa tema admin
  if (pathname.startsWith('/admin')) {
    return true;
  }

  // Teacher/Student usam tema próprio
  return false;
}

export async function ThemeScript() {
  let cssVars = '';

  try {
    // Busca pathname atual
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    // Busca sessão do usuário
    const session = await auth();

    // Decide qual tema usar baseado em hierarquia
    if (shouldUseAdminTheme(pathname)) {
      // Usa tema admin
      const adminTheme = await getAdminTheme();
      cssVars = generateCssVariables(adminTheme);
    } else if (session?.user?.id) {
      // Usuário logado em rota teacher/student: usa tema customizado (com fallback)
      const userTheme = await getUserTheme(session.user.id);
      const colors = userTheme.preset.light; // Sempre light no SSR, next-themes ajusta depois
      cssVars = generateCssVariables(colors);
    } else {
      // Fallback: tema admin
      const adminTheme = await getAdminTheme();
      cssVars = generateCssVariables(adminTheme);
    }
  } catch (error) {
    console.error('[ThemeScript] Erro ao gerar CSS variables:', error);

    // Fallback: tema padrão hardcoded
    cssVars = `
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 215 28% 17%;
    --secondary-foreground: 210 40% 98%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 221 83% 53%;
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;
    --error: 0 84% 60%;
    `;
  }

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  try {
    // Aplica CSS variables no :root IMEDIATAMENTE
    const root = document.documentElement;
    const vars = \`${cssVars}\`;
    
    // Parse e aplica cada variável
    vars.split(';').forEach(function(line) {
      const parts = line.trim().split(':');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key.startsWith('--')) {
          root.style.setProperty(key, value);
        }
      }
    });
  } catch (e) {
    console.error('[theme-script] Erro ao aplicar tema:', e);
  }
})();
        `,
      }}
    />
  );
}
