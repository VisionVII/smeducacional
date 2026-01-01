/**
 * ============================================
 * THEME SCRIPT - INLINE CSS INJECTION (SSR)
 * ============================================
 *
 * Script injetado no <head> para aplicar tema ANTES do React hidratar.
 * Zero FOUC (Flash of Unstyled Content).
 *
 * LÓGICA HIERÁRQUICA:
 * - ADMIN role → Tema admin (SystemConfig)
 * - TEACHER/STUDENT roles → Tema próprio (UserTheme ou forest-green padrão)
 * - Não autenticado → Tema admin
 *
 * IMPORTANTE: Este é um Server Component que gera um <style> inline.
 */

import { auth } from '@/lib/auth';
import { getUserTheme } from '@/lib/themes/get-user-theme';
import { getAdminThemePreset } from '@/lib/themes/get-admin-theme';
import { generateCssVariables } from '@/lib/themes/presets';
import type { Session } from 'next-auth';

export async function ThemeScript() {
  let lightVars = '';
  let darkVars = '';
  let session: Session | null = null;

  try {
    // Busca sessão do usuário (pode falhar em rotas estáticas ou sem conexão BD)
    // Timeout de 3 segundos para não bloquear a página
    session = await Promise.race([
      auth().catch(() => null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
  } catch (error) {
    console.debug(
      '[ThemeScript] Erro ao obter sessão (banco pode estar indisponível), usando tema admin:',
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
    session = null;
  }

  try {
    // LÓGICA CORRIGIDA: Verifica ROLE do usuário ao invés de pathname
    // - ADMIN role → usa tema admin
    // - TEACHER/STUDENT roles → usa tema próprio
    if (session?.user?.id && session.user.role !== 'ADMIN') {
      // Teacher ou Student: usa tema customizado (com fallback ao admin)
      try {
        const userTheme = (await Promise.race([
          getUserTheme(session.user.id),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Timeout ao buscar tema do usuário')),
              2000
            )
          ),
        ])) as Awaited<ReturnType<typeof getUserTheme>>;
        lightVars = generateCssVariables(userTheme.preset.light);
        darkVars = generateCssVariables(userTheme.preset.dark);

        console.log(
          `[ThemeScript] Aplicando tema de ${session.user.role} (${userTheme.presetId})`
        );
      } catch {
        // Fallback para tema admin se falhar
        const adminPreset = await getAdminThemePreset();
        lightVars = generateCssVariables(adminPreset.light);
        darkVars = generateCssVariables(adminPreset.dark);
        console.log(
          '[ThemeScript] Erro ao carregar tema do usuário, usando tema admin'
        );
      }
    } else {
      // Admin ou não autenticado: usa tema admin
      const adminPreset = await getAdminThemePreset();
      lightVars = generateCssVariables(adminPreset.light);
      darkVars = generateCssVariables(adminPreset.dark);

      console.log(
        `[ThemeScript] Aplicando tema ADMIN (role: ${
          session?.user?.role || 'guest'
        })`
      );
    }
  } catch (error) {
    console.error(
      '[ThemeScript] Erro ao gerar CSS variables:',
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

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
    --highlight: 38 92% 58%;
    --highlight-foreground: 222 84% 5%;
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

  // Retorna <style> tag com CSS variables no :root
  // Cada role tem seu tema independente aplicado globalmente
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
