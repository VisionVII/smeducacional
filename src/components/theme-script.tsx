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
import { getAdminThemePreset } from '@/lib/themes/get-admin-theme';
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
  let lightVars = '';
  let darkVars = '';

  try {
    // Busca pathname atual
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    // Busca sessão do usuário
    const session = await auth();

    // NOVA LÓGICA: Teacher/Student sempre usam tema PRÓPRIO
    // Admin theme APENAS em rotas públicas e /admin
    if (
      session?.user?.id &&
      !pathname.startsWith('/admin') &&
      !shouldUseAdminTheme(pathname)
    ) {
      // Usuário logado em rota autenticada: usa tema customizado (com fallback ao admin)
      const userTheme = await getUserTheme(session.user.id);
      lightVars = generateCssVariables(userTheme.preset.light);
      darkVars = generateCssVariables(userTheme.preset.dark);

      console.log(
        `[ThemeScript] Aplicando tema de ${session.user.role} (${userTheme.presetId}) em ${pathname}`
      );
    } else {
      // Rotas públicas ou admin: usa tema admin
      const adminPreset = await getAdminThemePreset();
      lightVars = generateCssVariables(adminPreset.light);
      darkVars = generateCssVariables(adminPreset.dark);

      console.log(`[ThemeScript] Aplicando tema ADMIN em ${pathname}`);
    }
  } catch (error) {
    console.error('[ThemeScript] Erro ao gerar CSS variables:', error);

    // Fallback: tema padrão hardcoded
    lightVars = `
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
    darkVars = lightVars; // Mesmas cores para fallback
  }

  // Retorna <style> tag com escopo correto por rota
  // Admin theme sempre no :root (rotas públicas + /admin)
  // User themes aplicados via data-theme-scope attribute
  return (
    <style
      id="theme-vars"
      dangerouslySetInnerHTML={{
        __html: `
:root {
  ${lightVars}
}

.dark {
  ${darkVars}
}
        `,
      }}
    />
  );
}
