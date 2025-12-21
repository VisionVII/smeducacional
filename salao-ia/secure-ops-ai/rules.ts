/**
 * 🔒 SecureOpsAI - Security Rules
 *
 * Regras de segurança baseadas em OWASP Top 10 e boas práticas Next.js
 */

import { SecurityRule } from './types';

export const SECURITY_RULES: SecurityRule[] = [
  // ==================== AUTHENTICATION ====================
  {
    id: 'AUTH-001',
    name: 'Missing auth() check in API route',
    category: 'authentication',
    severity: 'CRITICAL',
    description: 'API route não possui validação de autenticação',
    pattern: /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/,
    customCheck: (code: string, filePath: string) => {
      if (!filePath.includes('/api/')) return false;
      if (filePath.includes('/api/auth/')) return false; // NextAuth routes
      if (filePath.includes('/api/webhooks/')) return false; // Webhooks públicos

      const hasAuth = /await\s+auth\(\)/.test(code);
      const isPublicRoute = /\/api\/(courses|categories|public)/.test(filePath);

      return !hasAuth && !isPublicRoute;
    },
    suggestion:
      'Adicione: const session = await auth(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });',
    owaspReference: 'A07:2021 – Identification and Authentication Failures',
  },
  {
    id: 'AUTH-002',
    name: 'Missing role-based access control (RBAC)',
    category: 'authorization',
    severity: 'HIGH',
    description: 'API route tem auth() mas não verifica role do usuário',
    customCheck: (code: string, filePath: string) => {
      if (
        !filePath.includes('/api/admin/') &&
        !filePath.includes('/api/teacher/')
      )
        return false;

      const hasAuth = /await\s+auth\(\)/.test(code);
      const hasRoleCheck =
        /session\.user\.role\s*(!==|===)\s*['"]?(ADMIN|TEACHER|STUDENT)['"]?/.test(
          code
        );

      return hasAuth && !hasRoleCheck;
    },
    suggestion:
      'Adicione: if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });',
    owaspReference: 'A01:2021 – Broken Access Control',
  },

  // ==================== VALIDATION ====================
  {
    id: 'VAL-001',
    name: 'Missing Zod validation in API route',
    category: 'validation',
    severity: 'HIGH',
    description: 'API route processa req.body sem validação Zod',
    customCheck: (code: string, filePath: string) => {
      if (!filePath.includes('/api/')) return false;
      if (!/POST|PUT|PATCH/.test(code)) return false;

      const hasBodyParse = /await\s+req\.json\(\)/.test(code);
      const hasZodValidation =
        /\.safeParse\(/.test(code) || /\.parse\(/.test(code);

      return hasBodyParse && !hasZodValidation;
    },
    suggestion:
      'Use Zod: const result = schema.safeParse(body); if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });',
    owaspReference: 'A03:2021 – Injection',
  },
  {
    id: 'VAL-002',
    name: 'Direct body usage without validation',
    category: 'validation',
    severity: 'CRITICAL',
    description:
      'Dados de req.body sendo usados diretamente no Prisma sem validação',
    pattern: /prisma\.\w+\.(create|update|upsert)\(\s*{\s*data:\s*body/,
    suggestion: 'NUNCA use req.body direto. Valide com Zod e use result.data',
    owaspReference: 'A03:2021 – Injection',
  },

  // ==================== SECRETS ====================
  {
    id: 'SEC-001',
    name: 'Hardcoded secret or password',
    category: 'secrets',
    severity: 'CRITICAL',
    description: 'Secret, senha ou API key hardcoded no código',
    pattern: /(password|secret|api_key|apiKey)\s*=\s*['"][^'"]+['"]/i,
    suggestion: 'Use variáveis de ambiente: process.env.YOUR_SECRET',
    owaspReference: 'A02:2021 – Cryptographic Failures',
  },
  {
    id: 'SEC-002',
    name: 'Exposed sensitive data in NEXT_PUBLIC_',
    category: 'secrets',
    severity: 'HIGH',
    description: 'Variável sensível exposta com prefixo NEXT_PUBLIC_',
    pattern: /NEXT_PUBLIC_(SECRET|API_KEY|TOKEN|PASSWORD)/i,
    suggestion:
      'NUNCA use NEXT_PUBLIC_ para secrets. Esses são expostos no browser!',
    owaspReference: 'A02:2021 – Cryptographic Failures',
  },

  // ==================== RATE LIMITING ====================
  {
    id: 'RATE-001',
    name: 'Missing rate limiting on public endpoint',
    category: 'rate-limiting',
    severity: 'MEDIUM',
    description: 'Endpoint público sem rate limiting',
    customCheck: (code: string, filePath: string) => {
      const isAuthEndpoint =
        /\/api\/auth\/(login|register|forgot-password|reset-password)/.test(
          filePath
        );
      const isCheckoutEndpoint = /\/api\/checkout\//.test(filePath);
      const hasRateLimit = /checkRateLimit|rateLimit/.test(code);

      return (isAuthEndpoint || isCheckoutEndpoint) && !hasRateLimit;
    },
    suggestion:
      'Adicione rate limiting: const rateLimitResult = await checkRateLimit(ip, { limit: 5, windowSeconds: 60 });',
    owaspReference: 'A04:2021 – Insecure Design',
  },

  // ==================== INJECTION ====================
  {
    id: 'INJ-001',
    name: 'Potential SQL injection via raw query',
    category: 'injection',
    severity: 'CRITICAL',
    description: 'Query SQL com concatenação de strings',
    pattern: /\$\{.*\}/,
    customCheck: (code: string) => {
      return /prisma\.\$queryRaw/.test(code) && /\$\{/.test(code);
    },
    suggestion:
      'Use Prisma parametrizado: prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`',
    owaspReference: 'A03:2021 – Injection',
  },

  // ==================== XSS ====================
  {
    id: 'XSS-001',
    name: 'dangerouslySetInnerHTML without sanitization',
    category: 'xss',
    severity: 'HIGH',
    description: 'HTML sendo injetado sem sanitização',
    pattern: /dangerouslySetInnerHTML/,
    suggestion:
      'Sanitize com DOMPurify ou evite dangerouslySetInnerHTML. React já faz escape automático.',
    owaspReference: 'A03:2021 – Injection',
  },

  // ==================== ERROR HANDLING ====================
  {
    id: 'ERR-001',
    name: 'Sensitive error exposed to client',
    category: 'misconfiguration',
    severity: 'MEDIUM',
    description: 'Stack trace ou mensagem de erro detalhada exposta',
    pattern: /error\.(message|stack)/,
    customCheck: (code: string) => {
      return /NextResponse\.json\(.*error\.(message|stack)/.test(code);
    },
    suggestion:
      'Não exponha error.message/stack. Use mensagens genéricas no cliente e log detalhado no servidor.',
    owaspReference: 'A05:2021 – Security Misconfiguration',
  },

  // ==================== BEST PRACTICES ====================
  {
    id: 'BP-001',
    name: 'Missing HTTP status code in error response',
    category: 'best-practices',
    severity: 'LOW',
    description: 'Resposta de erro sem status code apropriado',
    customCheck: (code: string) => {
      const hasErrorReturn = /return\s+NextResponse\.json\(\s*{\s*error:/.test(
        code
      );
      const hasStatusCode = /,\s*{\s*status:\s*\d+\s*}\s*\)/.test(code);

      return hasErrorReturn && !hasStatusCode;
    },
    suggestion:
      'Adicione status code: NextResponse.json({ error: "..." }, { status: 400 })',
    owaspReference: undefined,
  },
  {
    id: 'BP-002',
    name: 'console.log in production code',
    category: 'best-practices',
    severity: 'INFO',
    description: 'console.log pode expor informações em produção',
    pattern: /console\.log\(/,
    suggestion:
      'Use console.error para logs importantes ou remova console.logs em produção',
    owaspReference: undefined,
  },
];

// Custom Rules (Project-Specific)
export const CUSTOM_RULES: SecurityRule[] = [
  {
    id: 'CUSTOM-001',
    name: 'Feature flag without fallback',
    category: 'best-practices',
    severity: 'LOW',
    description: 'Feature flag sem fallback seguro',
    pattern: /canAccessFeature\(/,
    customCheck: (code: string) => {
      const hasFeatureCheck = /canAccessFeature\(/.test(code);
      const hasFallback = /catch|\.then/.test(code);

      return hasFeatureCheck && !hasFallback;
    },
    suggestion: 'Adicione try-catch ou fallback para feature flags',
    owaspReference: undefined,
  },
];

// Merge all rules
export const ALL_RULES = [...SECURITY_RULES, ...CUSTOM_RULES];
