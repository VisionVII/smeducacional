import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const schema = z.object({
  text: z.string().min(1),
  to: z.string().min(2),
  from: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const limit = await checkRateLimit(ip, { limit: 30, windowSeconds: 60 });
    if (!limit.success) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${limit.retryAfter}s` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { text, to, from } = parsed.data;

    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    if (!key || !region) {
      return NextResponse.json(
        { error: 'Serviço de tradução não configurado' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({ 'api-version': '3.0', to });
    if (from) params.set('from', from);

    const resp = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ Text: text }]),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      return NextResponse.json({ error: 'Falha na tradução', details: msg }, { status: 502 });
    }

    const data = await resp.json();
    const translated = data?.[0]?.translations?.[0]?.text ?? '';

    return NextResponse.json({ data: { translated } });
  } catch (error) {
    console.error('[API /translate POST]', error);
    return NextResponse.json({ error: 'Erro ao traduzir' }, { status: 500 });
  }
}
