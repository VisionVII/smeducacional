// src/lib/openaiAssistant.ts
// Integração com OpenAI Assistants API (Node.js/TypeScript)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

if (!OPENAI_API_KEY || !OPENAI_ASSISTANT_ID) {
  throw new Error(
    'OPENAI_API_KEY e OPENAI_ASSISTANT_ID devem estar definidos no .env'
  );
}

export async function sendMessageToAssistant(
  message: string,
  threadId?: string
) {
  // Cria um novo thread se não existir
  let currentThreadId = threadId;
  if (!currentThreadId) {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const threadData = await threadRes.json();
    currentThreadId = threadData.id;
  }

  // Envia mensagem para o assistente
  await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'user',
      content: message,
    }),
  });

  // Executa o assistente
  const runRes = await fetch(
    `https://api.openai.com/v1/assistants/${OPENAI_ASSISTANT_ID}/runs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_id: currentThreadId,
      }),
    }
  );
  const runData = await runRes.json();

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
        },
      }
    );
    const checkData = await checkRes.json();
    status = checkData.status;
    attempts++;
  }

  // Buscar mensagens do assistant
  const messagesRes = await fetch(
    `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  const messagesData = await messagesRes.json();
  // Log para depuração (apenas em dev)
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      '[OpenAI Assistant] messagesData:',
      JSON.stringify(messagesData, null, 2)
    );
  }
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

  return {
    threadId: currentThreadId,
    content: assistantMessage?.content?.[0]?.text?.value || null,
    status,
  };
}
