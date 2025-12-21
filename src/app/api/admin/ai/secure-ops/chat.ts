import { NextRequest, NextResponse } from 'next/server';
import {
  initializeContext,
  presentAnalysisToUser,
  askPreferredLanguageStyle,
  adaptResponseLanguage,
  askPdfExportConfirmation,
} from '@/lib/secureOpsAI';

// Endpoint: /api/admin/ai/secure-ops/chat
export async function POST(_req: NextRequest) {
  // Log auditável
  console.log('[SecureOpsAI][chat] Nova query recebida');
  try {
    // 1. Pergunta linguagem preferida
    const lang = await askPreferredLanguageStyle();
    // 2. Inicializa contexto e executa análise
    await initializeContext();
    const analysis = await presentAnalysisToUser();
    // 3. Adapta resposta
    const resposta = await adaptResponseLanguage(analysis, lang);
    // 4. Pergunta se deseja PDF
    const askPdf = await askPdfExportConfirmation();
    return NextResponse.json({ resposta, askPdf });
  } catch (error) {
    console.error('[SecureOpsAI][chat] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno no agente SecureOpsAI.' },
      { status: 500 }
    );
  }
}
