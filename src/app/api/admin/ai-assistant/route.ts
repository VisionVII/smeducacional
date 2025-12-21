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
    // Se houver erro, retorna erro detalhado para o frontend
    if (result?.error) {
      return NextResponse.json(
        {
          error: result.error,
          status: result.status,
          details: result.messagesData || result.error,
        },
        { status: 500 }
      );
    }
    // Retorna o conteúdo gerado pelo assistant
    return NextResponse.json({
      result: result?.content || 'Nenhuma resposta do assistente.',
      status: result?.status,
    });
  } catch (error) {
    console.error('[API /admin/ai-assistant]', error);
    return NextResponse.json(
      { error: 'Erro ao consultar o agente.' },
      { status: 500 }
    );
  }
}
