export async function translate(
  text: string,
  to: string,
  from?: string
): Promise<string> {
  const resp = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, to, from }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || 'Falha ao traduzir');
  }
  const data = await resp.json();
  return data?.data?.translated ?? '';
}
