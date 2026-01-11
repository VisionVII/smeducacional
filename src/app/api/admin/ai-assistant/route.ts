import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToAssistant } from '@/lib/openaiAssistant';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Segurança: Apenas ADMIN pode usar AI Assistant
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

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
