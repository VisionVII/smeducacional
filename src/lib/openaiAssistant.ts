// src/lib/openaiAssistant.ts
// Integração com OpenAI Assistants API (Node.js/TypeScript)

function getOpenAICredentials() {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  if (!apiKey || !assistantId) {
    return null;
  }

  return { apiKey, assistantId };
}

export async function sendMessageToAssistant(
  message: string,
  threadId?: string
) {
  const creds = getOpenAICredentials();
  if (!creds) {
    return {
      threadId: null,
      content: null,
      status: 'not_configured',
      error: 'OpenAI not configured',
    };
  }

  const { apiKey: OPENAI_API_KEY, assistantId: OPENAI_ASSISTANT_ID } = creds;
  // Cria um novo thread se não existir
  let currentThreadId = threadId;
  if (!currentThreadId) {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
    });
    const threadData = await threadRes.json();
    if (!threadData.id) {
      console.error('[OpenAI Assistant] Erro ao criar thread:', threadData);
      return {
        threadId: null,
        content: null,
        status: 'thread_error',
        error: threadData,
      };
    }
    currentThreadId = threadData.id;
  }

  // Envia mensagem para o assistente
  const msgRes = await fetch(
    `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    }
  );
  const msgData = await msgRes.json();
  if (!msgRes.ok) {
    console.error('[OpenAI Assistant] Erro ao enviar mensagem:', msgData);
    return {
      threadId: currentThreadId,
      content: null,
      status: 'message_error',
      error: msgData,
    };
  }

  // Executa o assistente
  const runRes = await fetch(
    `https://api.openai.com/v1/threads/${currentThreadId}/runs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: OPENAI_ASSISTANT_ID,
      }),
    }
  );
  const runData = await runRes.json();
  if (!runRes.ok) {
    console.error('[OpenAI Assistant] Erro ao executar run:', runData);
    return {
      threadId: currentThreadId,
      content: null,
      status: 'run_error',
      error: runData,
    };
  }

  // Polling para resposta final
  let status = runData.status;
  let attempts = 0;
  const maxAttempts = 40;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  while (
    status !== 'completed' &&
    status !== 'failed' &&
    attempts < maxAttempts
  ) {
    await delay(1500);
    const checkRes = await fetch(
      `https://api.openai.com/v1/threads/${currentThreadId}/runs/${runData.id}`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );
    const checkData = await checkRes.json();
    if (!checkRes.ok) {
      console.error('[OpenAI Assistant] Erro ao checar run:', checkData);
      return {
        threadId: currentThreadId,
        content: null,
        status: 'run_check_error',
        error: checkData,
      };
    }
    status = checkData.status;
    attempts++;
  }

  // Buscar mensagens do assistant
  const messagesRes = await fetch(
    `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    }
  );
  const messagesData = await messagesRes.json();
  if (!messagesRes.ok) {
    console.error('[OpenAI Assistant] Erro ao buscar mensagens:', messagesData);
    return {
      threadId: currentThreadId,
      content: null,
      status: 'messages_error',
      error: messagesData,
    };
  }
  // Log para depuração (sempre)
  console.log(
    '[OpenAI Assistant] messagesData:',
    JSON.stringify(messagesData, null, 2)
  );
  type AssistantMsg = {
    id: string;
    object: string;
    created_at: number;
    thread_id: string;
    role: 'user' | 'assistant';
    content: Array<{ type: string; text: { value: string } }>;
  };
  const assistantMessage = (messagesData.data as AssistantMsg[])
    ?.reverse()
    .find((msg) => msg.role === 'assistant');

  if (!assistantMessage || !assistantMessage.content?.[0]?.text?.value) {
    console.error(
      '[OpenAI Assistant] Nenhuma resposta do assistente.',
      messagesData
    );
    return {
      threadId: currentThreadId,
      content: null,
      status,
      error: 'Nenhuma resposta do assistente.',
      messagesData,
    };
  }

  return {
    threadId: currentThreadId,
    content: assistantMessage.content[0].text.value,
    status,
  };
}
