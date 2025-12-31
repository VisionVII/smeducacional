/**
 * AIService.ts
 * Serviço de IA para Chat do Estudante
 *
 * Abstrai toda a lógica de comunicação com IA, validação de matrícula e deflecção inteligente.
 * Implementa o padrão Service definido em system-blueprint.md
 *
 * Métodos principais:
 * - validateEnrollmentContext: Valida se mensagem está dentro do contexto dos cursos matriculados
 * - processStudentMessage: Processa mensagem com validação automática
 * - generateAIResponse: Chama LLM com context apropriado (FUTURO: Claude/OpenAI)
 */

import { prisma } from '@/lib/db';

export interface EnrollmentContext {
  enrolledCourses: Array<{
    id: string;
    title: string;
    slug: string;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
      }>;
    }>;
  }>;
  unenrolledMentioned: Array<{
    title: string;
    slug: string;
  }>;
  isContextValid: boolean;
}

/**
 * Busca contexto de matrícula do estudante
 */
export async function getEnrollmentContext(
  userId: string
): Promise<EnrollmentContext> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: userId,
      status: 'ACTIVE',
      course: {
        deletedAt: null,
        isPublished: true,
      },
    },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          modules: {
            where: { deletedAt: null },
            select: {
              id: true,
              title: true,
              lessons: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    enrolledCourses: enrollments.map((e) => e.course),
    unenrolledMentioned: [],
    isContextValid: enrollments.length > 0,
  };
}

/**
 * Valida se a mensagem está relacionada aos cursos matriculados
 * Retorna deflecção inteligente se mencionar cursos não matriculados
 */
export async function validateMessageContext(
  userId: string,
  message: string,
  context: EnrollmentContext
): Promise<{
  isValid: boolean;
  deflectionResponse?: string;
}> {
  if (!context.isContextValid) {
    return {
      isValid: false,
      deflectionResponse:
        'Você não está matriculado em nenhum curso. Para usar o Chat IA, matricule-se em um curso primeiro!',
    };
  }

  // Extrair possíveis menções de cursos
  const mentionedCourses = extractCourseMentions(message);

  if (mentionedCourses.length === 0) {
    // Pergunta genérica - permitir resposta contextualizada
    return { isValid: true };
  }

  // Verificar se mencionou algum curso que não está matriculado
  const unenrolledCourses = await findUnenrolledCoursesByTitle(
    userId,
    mentionedCourses
  );

  if (unenrolledCourses.length > 0) {
    const deflection = generateDeflectionMessage(
      unenrolledCourses,
      context.enrolledCourses
    );
    return {
      isValid: false,
      deflectionResponse: deflection,
    };
  }

  return { isValid: true };
}

/**
 * Extrai títulos de cursos mencionados na mensagem
 */
function extractCourseMentions(message: string): string[] {
  // Padrões para detectar menções de cursos
  const patterns = [
    /(?:no\s+curso\s+['""]?)?(?:de\s+)?([\w\s-]+?)['""]?\s+(?:módulo|aula|conteúdo|aula|lição)/gi,
    /(?:sobre|para|em)\s+([\w\s-]+?)\s+(?:curso|módulo)/gi,
    /curso\s+['""]?([\w\s-]+?)['""]?/gi,
  ];

  const mentions = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      if (match[1]) {
        mentions.add(match[1].trim().toLowerCase());
      }
    }
  }

  return Array.from(mentions);
}

/**
 * Encontra cursos não matriculados por título
 */
async function findUnenrolledCoursesByTitle(
  userId: string,
  mentionedTitles: string[]
): Promise<Array<{ title: string; slug: string }>> {
  const courses = await prisma.course.findMany({
    where: {
      OR: mentionedTitles.map((title) => ({
        title: {
          contains: title,
          mode: 'insensitive',
        },
      })),
      isPublished: true,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      enrollments: {
        where: {
          studentId: userId,
          status: 'ACTIVE',
        },
      },
    },
  });

  // Retornar apenas cursos que o usuário NÃO está matriculado
  return courses
    .filter((c) => c.enrollments.length === 0)
    .map((c) => ({
      title: c.title,
      slug: c.slug,
    }));
}

/**
 * Gera mensagem de deflecção inteligente
 */
function generateDeflectionMessage(
  unenrolledCourses: Array<{ title: string; slug: string }>,
  enrolledCourses: Array<{ title: string; slug: string }>
): string {
  const courseTitle = unenrolledCourses[0].title;
  const courseSlug = unenrolledCourses[0].slug;

  let response = `📚 **Pergunta sobre "${courseTitle}"**\n\n`;
  response += `Vejo que você está perguntando sobre este tópico, mas você ainda não está matriculado no curso **"${courseTitle}"**.\n\n`;

  if (enrolledCourses.length > 0) {
    response += `Atualmente você está matriculado em:\n`;
    enrolledCourses.forEach((course) => {
      response += `• ${course.title}\n`;
    });
    response += `\n`;
  }

  response += `**Como proceder?**\n`;
  response += `1. Visite o curso: ${process.env.NEXT_PUBLIC_URL}/courses/${courseSlug}\n`;
  response += `2. Faça a matrícula\n`;
  response += `3. Volte aqui e faça suas perguntas!\n\n`;
  response += `Você está interessado neste curso? Posso ajudá-lo com informações sobre ele primeiro!`;

  return response;
}

/**
 * Processa mensagem do estudante com validação completa
 * Retorna resposta (deflecção ou processamento normal)
 */
export async function processStudentMessage(
  userId: string,
  message: string
): Promise<string> {
  // 1. Buscar contexto de matrícula
  const context = await getEnrollmentContext(userId);

  // 2. Validar contexto
  const validation = await validateMessageContext(userId, message, context);

  if (!validation.isValid && validation.deflectionResponse) {
    return validation.deflectionResponse;
  }

  // 3. Gerar resposta (futuramente integrar com LLM real)
  return generateAIResponse(message, context);
}

/**
 * Gera resposta de IA baseada no contexto
 * FUTURO: Integrar com Claude/OpenAI passando contexto dos cursos
 */
function generateAIResponse(
  message: string,
  context: EnrollmentContext
): string {
  const { enrolledCourses } = context;

  // Placeholder: Resposta inteligente baseada em padrões
  const responseTemplates: Record<string, (courses: string[]) => string> = {
    help: (courses) =>
      `Com prazer! Vejo que você está estudando ${courses}. Como posso ajudá-lo especificamente?`,

    understand: (courses) =>
      `Entendi! Relacionado ao que você está aprendendo em ${courses[0]}, `,

    example: (courses) =>
      `Ótimo exemplo! Com base no conteúdo de ${courses[0]}, um exemplo prático seria: `,

    exercise: (courses) =>
      `Para resolver este exercício do curso ${courses[0]}, considere os seguintes passos: `,

    concept: (courses) =>
      `Este conceito é fundamental! Nos seus cursos (${courses.join(
        ', '
      )}), você aprenderá: `,

    default: (courses) =>
      `Obrigado pela pergunta! Com base nos seus cursos (${courses.join(
        ', '
      )}), `,
  };

  const courseTitles = enrolledCourses.map((c) => `"${c.title}"`);

  // Detectar tipo de pergunta
  let template = responseTemplates.default;

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('ajud') || lowerMessage.includes('pode')) {
    template = responseTemplates.help;
  } else if (
    lowerMessage.includes('entend') ||
    lowerMessage.includes('significa')
  ) {
    template = responseTemplates.understand;
  } else if (
    lowerMessage.includes('exemplo') ||
    lowerMessage.includes('demonstr')
  ) {
    template = responseTemplates.example;
  } else if (lowerMessage.includes('exerc') || lowerMessage.includes('fazer')) {
    template = responseTemplates.exercise;
  } else if (
    lowerMessage.includes('conceito') ||
    lowerMessage.includes('o que é')
  ) {
    template = responseTemplates.concept;
  }

  return (
    template(courseTitles) +
    '\n\nPara uma resposta mais precisa, recomendo consultar o material da aula ou entrar em contato com o instrutor do curso.'
  );
}

/**
 * Registra interação com IA (para analytics futuramente)
 */
export async function logAIInteraction(
  userId: string,
  message: string,
  response: string,
  enrolledCourseIds: string[]
): Promise<void> {
  // FUTURO: Armazenar em tabela de logs para análise de padrões
  // Usar AuditService para registrar interações significativas

  if (message.length > 500 || response.includes('**')) {
    console.log('[AIService] Interação registrada:', {
      userId,
      messageLength: message.length,
      courseCount: enrolledCourseIds.length,
      timestamp: new Date(),
    });
  }
}
