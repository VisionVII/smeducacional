'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

// IDs dos agentes (pode ser carregado de config/api futuramente)
const AGENTS = [
  {
    id: process.env.NEXT_PUBLIC_SECURE_OPS_AI_ID || '',
    label: 'SecureOpsAI',
    description: 'Agente de Segurança e Compliance',
    placeholder: 'Cole aqui o código da API Route/backend para auditoria...',
  },
  // Adicione outros agentes aqui
  // { id: 'asst_...', label: 'UIDirectorAI', description: 'Agente de UI/UX', placeholder: '...' },
];

export default function AdminAIAssistantPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  const handleSend = async () => {
    if (!input.trim()) {
      toast({ title: 'Digite o input para o agente.' });
      return;
    }
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agentId: selectedAgent.id }),
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
          <CardTitle>
            {selectedAgent.label}{' '}
            <span className="text-xs font-normal text-muted-foreground ml-2">
              ({selectedAgent.description})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Agente</label>
            <Select
              value={selectedAgent.id}
              onValueChange={(val) => {
                const found = AGENTS.find((a) => a.id === val);
                if (found) setSelectedAgent(found);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedAgent.placeholder}
            rows={8}
            className="min-h-[120px]"
          />
          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
          <div className="bg-muted rounded p-4 whitespace-pre-wrap border text-sm min-h-[48px]">
            {response || 'Nenhuma resposta do assistente.'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
