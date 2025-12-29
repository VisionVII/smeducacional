'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslatedToast } from '@/lib/translation-helpers';
import { cn } from '@/lib/utils';

const AGENTS = [
  {
    id: process.env.NEXT_PUBLIC_SECURE_OPS_AI_ID || '',
    label: 'SecureOpsAI',
    description: 'Agente de Segurança e Compliance',
    avatar: '/icons/secureopsai.svg',
    placeholder: 'Digite sua dúvida ou solicitação de auditoria...',
  },
  // Adicione outros agentes aqui
  // { id: "asst_...", label: "UIDirectorAI", description: "Agente de UI/UX", avatar: "/icons/ui.svg", placeholder: "..." },
];

export function AIAssistantChat() {
  const toast = useTranslatedToast();
  const AGENTS_FILTERED = AGENTS.filter((a) => !!a.id && a.id !== '');
  const [selectedAgent, setSelectedAgent] = useState(
    AGENTS_FILTERED[0] || {
      id: 'no-agent',
      label: 'Nenhum agente disponível',
      description: '',
      avatar: '/icons/secureopsai.svg',
      placeholder:
        'Nenhum agente configurado. Verifique as variáveis de ambiente.',
    }
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      agent: selectedAgent.label,
      content: `Olá! Eu sou o ${selectedAgent.label}. Como posso ajudar na auditoria ou segurança do sistema?`,
      avatar: selectedAgent.avatar,
    },
  ]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      toast.error('generic');
      return;
    }
    setLoading(true);
    setMessages((msgs) => [
      ...msgs,
      {
        role: 'user',
        agent: selectedAgent.label,
        content: input,
        avatar: '/icons/user.svg',
      },
    ]);
    setInput('');
    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agentId: selectedAgent.id }),
      });
      const data = await res.json();
      if (res.ok && data?.result) {
        setMessages((msgs) => [
          ...msgs,
          {
            role: 'assistant',
            agent: selectedAgent.label,
            content: data.result,
            avatar: selectedAgent.avatar,
          },
        ]);
      } else {
        toast.error('generic');
      }
    } catch {
      toast.error('generic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-lg border border-muted bg-background">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image
              src={selectedAgent.avatar}
              alt="avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border"
              unoptimized
            />
            <CardTitle className="text-lg font-bold">
              {selectedAgent.label}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                ({selectedAgent.description})
              </span>
            </CardTitle>
          </div>
          <Select
            value={selectedAgent.id}
            onValueChange={(val) => {
              const found = AGENTS_FILTERED.find((a) => a.id === val);
              if (found) setSelectedAgent(found);
            }}
            disabled={AGENTS_FILTERED.length === 0}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Selecione o agente" />
            </SelectTrigger>
            <SelectContent>
              {AGENTS_FILTERED.length === 0 ? (
                <SelectItem disabled value="no-agent">
                  Nenhum agente disponível
                </SelectItem>
              ) : (
                AGENTS_FILTERED.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            ref={chatRef}
            className="bg-muted rounded p-4 border h-80 overflow-y-auto flex flex-col gap-3"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <Image
                    src={msg.avatar}
                    alt="avatar"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border"
                    unoptimized
                  />
                )}
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm max-w-[70%]',
                    msg.role === 'assistant'
                      ? 'bg-background border text-primary'
                      : 'bg-primary text-background border-primary'
                  )}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <Image
                    src={msg.avatar}
                    alt="avatar"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border"
                    unoptimized
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <Image
                  src={selectedAgent.avatar}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full border animate-pulse"
                  unoptimized
                />
                <div className="rounded-lg px-4 py-2 text-sm bg-background border text-muted-foreground animate-pulse">
                  Pensando...
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedAgent.placeholder}
              rows={2}
              className="min-h-[40px] resize-none"
              disabled={AGENTS_FILTERED.length === 0 || loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={
                loading || AGENTS_FILTERED.length === 0 || !input.trim()
              }
              className="h-10 px-6"
            >
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
