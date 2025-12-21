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
  const messageRes = await fetch(
    `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    }
  );
  const messageData = await messageRes.json();

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

  // (Opcional) Poll para resposta final
  // ...

  return {
    threadId: currentThreadId,
    message: messageData,
    run: runData,
  };
}
