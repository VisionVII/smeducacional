import { StudentAIChatComponent } from '@/components/student/StudentAIChatComponent';

/**
 * Página de Chat IA para Estudantes
 * Requer:
 * - Autenticação como STUDENT
 * - Feature 'ai-assistant' desbloqueada (FeaturePurchase.status = 'active')
 * - Matrícula ativa em pelo menos um curso
 */
export default function StudentAIChatPage() {
  return <StudentAIChatComponent />;
}
