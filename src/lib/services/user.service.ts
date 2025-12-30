import { getTeacherAccessControl } from '@/lib/subscription';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

type FeatureId = 'ai-assistant' | 'mentorships' | 'pro-tools';

/**
 * Matriz de features permitidas por role.
 * Usada para validar feature flags contra acesso autorizado.
 */
const ROLE_FEATURE_MATRIX: Record<Role, FeatureId[]> = {
  ADMIN: ['ai-assistant', 'mentorships', 'pro-tools'],
  TEACHER: ['ai-assistant', 'mentorships', 'pro-tools'], // Validado por getTeacherAccessControl
  STUDENT: [], // Extensível via studentRecord futura
};

/**
 * Validar que as features ativas estão alinhadas com o plano autorizado.
 * Previne ativação não autorizada de features via side-channel attacks.
 */
export function validateFeatureAccess(
  role: Role,
  requestedFeatures: FeatureId[]
): { valid: boolean; unauthorized: FeatureId[] } {
  const authorizedFeatures = ROLE_FEATURE_MATRIX[role] || [];
  const unauthorized = requestedFeatures.filter(
    (f) => !authorizedFeatures.includes(f)
  );

  return {
    valid: unauthorized.length === 0,
    unauthorized,
  };
}

/**
 * Retorna os IDs das features contratadas para o usuário.
 * Mantém compatibilidade com roles e planos existentes.
 * Inclui validação de RBAC para evitar feature spoofing.
 */
export async function getUserFeatures(
  userId: string,
  role: Role
): Promise<FeatureId[]> {
  if (!userId) return [];

  let features: FeatureId[] = [];

  if (role === 'ADMIN') {
    features = ['ai-assistant', 'mentorships', 'pro-tools'];
  } else if (role === 'TEACHER') {
    const access = await getTeacherAccessControl(userId);

    if (access.isActive || access.isTrial) {
      features = ['ai-assistant', 'mentorships', 'pro-tools'];
    }
  }
  // STUDENT ou outros roles: sem features por padrão

  // Validar que features retornadas estão autorizadas para o role
  const validation = validateFeatureAccess(role, features);
  if (!validation.valid) {
    console.error(
      `[getUserFeatures] Unauthorized features detected for role ${role}:`,
      validation.unauthorized
    );
    // Retornar apenas features autorizadas (safe fallback)
    return features.filter((f) => ROLE_FEATURE_MATRIX[role].includes(f));
  }

  return features;
}
