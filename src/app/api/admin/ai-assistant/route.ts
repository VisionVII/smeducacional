import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToAssistant } from '@/lib/openaiAssistant';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida.' },
        { status: 400 }
      );
    }
    const result = await sendMessageToAssistant(message);
    // Aqui você pode customizar a resposta conforme o retorno do assistant
    return NextResponse.json({
      result: result?.run?.status || 'Consulta enviada ao agente.',
    });
  } catch (error) {
    console.error('[API /admin/ai-assistant]', error);
    return NextResponse.json(
      { error: 'Erro ao consultar o agente.' },
      { status: 500 }
    );
  }
}
