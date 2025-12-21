/**
 * 🔒 SecureOpsAI - Type Definitions
 *
 * Tipagens TypeScript para o agente de segurança
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type RuleCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'injection'
  | 'secrets'
  | 'rate-limiting'
  | 'xss'
  | 'csrf'
  | 'misconfiguration'
  | 'best-practices';

export interface SecurityRule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: SeverityLevel;
  description: string;
  pattern?: RegExp;
  customCheck?: (code: string, filePath: string) => boolean;
  suggestion: string;
  owaspReference?: string;
}

export interface SecurityIssue {
  id: string;
  ruleId: string;
  severity: SeverityLevel;
  category: RuleCategory;
  file: string;
  line: number;
  column?: number;
  message: string;
  code: string;
  suggestion: string;
  owaspReference?: string;
  cweId?: string;
  timestamp: string;
}

export interface ScanResult {
  timestamp: string;
  scanDuration: string;
  filesScanned: number;
  issuesFound: number;
  blocked: boolean; // Se scan bloqueou commit
  summary: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFO: number;
  };
  issues: SecurityIssue[];
  recommendations: string[];
  complianceScore: number; // 0-100
}

export interface ScanConfig {
  depth: 'quick' | 'full' | 'deep';
  autoFix: boolean;
  blockInsecure: boolean;
  minSeverity: SeverityLevel;
  maxIssues: number;
  ignorePaths: string[];
  targetFiles?: string[];
}

export interface GPTAnalysisRequest {
  code: string;
  filePath: string;
  context: {
    isApiRoute: boolean;
    isComponent: boolean;
    hasAuth: boolean;
    hasValidation: boolean;
  };
}

export interface GPTAnalysisResponse {
  issues: Array<{
    severity: SeverityLevel;
    line: number;
    message: string;
    suggestion: string;
    category: RuleCategory;
  }>;
  overallRisk: SeverityLevel;
  recommendations: string[];
}

export interface SecurityReport {
  projectName: string;
  scanDate: string;
  version: string;
  result: ScanResult;
  metadata: {
    nodeVersion: string;
    nextVersion: string;
    prismaVersion: string;
    dependencies: string[];
  };
}

export interface AutoFixSuggestion {
  issueId: string;
  file: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}
