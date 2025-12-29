/**
 * 🔒 SecureOpsAI - Configuration
 *
 * Configuração do GPT-4 e regras de scan de segurança
 */

import { ScanConfig } from './types';

// OpenAI Configuration
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.2'),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096'),
};

// Scan Configuration
export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  depth: (process.env.AI_SCAN_DEPTH as ScanConfig['depth']) || 'full',
  autoFix: process.env.AI_AUTO_FIX === 'true',
  blockInsecure: process.env.AI_BLOCK_INSECURE !== 'false',
  minSeverity:
    (process.env.AI_MIN_SEVERITY as ScanConfig['minSeverity']) || 'MEDIUM',
  maxIssues: parseInt(process.env.AI_MAX_ISSUES || '50'),
  ignorePaths: [
    'node_modules/**',
    '.next/**',
    'build/**',
    'dist/**',
    'prisma/migrations/**',
    'public/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    'salao-ia/**',
  ],
};

// Files to Always Scan (Critical Security)
export const CRITICAL_FILES = [
  'src/app/api/**/*.ts',
  'src/lib/auth.ts',
  'middleware.ts',
  'next.config.ts',
  '.env',
  '.env.local',
];

// Severity Weights (for scoring)
export const SEVERITY_WEIGHTS = {
  CRITICAL: 10,
  HIGH: 5,
  MEDIUM: 2,
  LOW: 1,
  INFO: 0,
};

// GPT System Prompt
export const SECURITY_SYSTEM_PROMPT = `Você é o SecureOpsAI, um agente especializado em segurança de aplicações Next.js.

**Contexto do Projeto:**
- Framework: Next.js 16.1.0 (App Router)
- Autenticação: NextAuth.js v4 (JWT strategy)
- Validação: Zod (obrigatória server-side)
- Database: Prisma + PostgreSQL
- Roles: ADMIN, TEACHER, STUDENT

**Sua Missão:**
Analisar código TypeScript/React e detectar vulnerabilidades de segurança REAIS, não teóricas.

**Focos Principais:**
1. ✅ Autenticação faltando em API routes protegidas
2. ✅ Validação Zod ausente ou incorreta
3. ✅ Role checks (RBAC) inadequados
4. ✅ Secrets hardcoded ou expostos
5. ✅ SQL Injection via raw queries
6. ✅ XSS via dangerouslySetInnerHTML
7. ✅ Rate limiting ausente em endpoints públicos
8. ✅ Erros que expõem informações sensíveis

**CRÍTICO: Patterns Obrigatórios do Projeto:**
- API Routes DEVEM ter: \`const session = await auth();\`
- Validação DEVE usar: \`schema.safeParse(body)\`
- Role check DEVE ter: \`if (session.user.role !== 'ADMIN') return ...\`
- Rate limit OBRIGATÓRIO em: /api/auth/*, /api/checkout/*

**NÃO É VULNERABILIDADE:**
- Usar Prisma ORM (já protege contra SQL injection)
- React escaping automático de strings
- NextAuth com NEXTAUTH_SECRET definido
- HTTPS configurado no Vercel

**Output Format:**
JSON com array de issues:
{
  "issues": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "line": <número>,
      "message": "<descrição concisa>",
      "suggestion": "<código corrigido ou ação>",
      "category": "authentication" | "validation" | ...
    }
  ],
  "overallRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
  "recommendations": ["<recomendação geral 1>", ...]
}

**Seja preciso, direto e pragmático. Apenas vulnerabilidades REAIS.**`;

// GPT Analysis Prompt Template
export const ANALYSIS_PROMPT_TEMPLATE = (
  code: string,
  filePath: string,
  context: {
    isApiRoute: boolean;
    hasAuth: boolean;
    hasValidation: boolean;
  }
) => `
Analise o seguinte código TypeScript para vulnerabilidades de segurança:

**Arquivo:** ${filePath}
**Contexto:**
- É API Route: ${context.isApiRoute}
- Tem auth(): ${context.hasAuth}
- Tem validação Zod: ${context.hasValidation}

**Código:**
\`\`\`typescript
${code}
\`\`\`

**Responda APENAS com JSON válido seguindo o formato especificado no System Prompt.**
`;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  slack: {
    enabled: !!process.env.AI_SLACK_WEBHOOK,
    webhook: process.env.AI_SLACK_WEBHOOK || '',
    minSeverity: 'HIGH' as const,
  },
  discord: {
    enabled: !!process.env.AI_DISCORD_WEBHOOK,
    webhook: process.env.AI_DISCORD_WEBHOOK || '',
    minSeverity: 'HIGH' as const,
  },
};

// Report Configuration
export const REPORT_CONFIG = {
  outputDir: process.env.AI_REPORT_DIR || './salao-ia/reports/security',
  formats: ['json', 'html'],
  keepHistory: 30, // dias
};
