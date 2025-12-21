'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function AdminAIAssistantPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      toast({ title: 'Digite uma mensagem para o agente.' });
      return;
    }
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (res.ok && data?.result) {
        setResponse(data.result);
      } else {
        toast({ title: 'Erro ao consultar o agente.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Agente de IA (OpenAI Assistant)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta ou comando para o agente..."
            rows={4}
            className="min-h-[100px]"
          />
          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
          {response && (
            <div className="bg-muted rounded p-4 whitespace-pre-wrap border text-sm">
              {response}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
