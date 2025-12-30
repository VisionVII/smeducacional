'use client';

import { useState } from 'react';
import {
  Bot,
  Shield,
  Database,
  Cloud,
  Code,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AgentStatus = 'idle' | 'processing' | 'success' | 'error';

type Agent = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AgentStatus;
  lastRun?: string;
  capabilities: string[];
};

const agents: Agent[] = [
  {
    id: 'architect',
    name: 'ArchitectAI',
    description: 'Define padrões de pasta e fluxos arquiteturais',
    icon: Code,
    status: 'idle',
    capabilities: [
      'Auditar layouts',
      'Validar estrutura',
      'Recomendar refactors',
    ],
  },
  {
    id: 'secure-ops',
    name: 'SecureOpsAI',
    description: 'Audita auth, roles, Zod e logs de auditoria',
    icon: Shield,
    status: 'idle',
    capabilities: ['Security scan', 'RBAC validation', 'Rate limit check'],
  },
  {
    id: 'db-master',
    name: 'DBMasterAI',
    description: 'Gerencia schema, migrations e Soft Deletes',
    icon: Database,
    status: 'idle',
    capabilities: ['Schema analysis', 'Migration review', 'Query optimization'],
  },
  {
    id: 'devops',
    name: 'DevOpsAI',
    description: 'Gerencia Docker, Infra, Supabase e Stripe',
    icon: Cloud,
    status: 'idle',
    capabilities: ['Deployment', 'Monitoring', 'Infrastructure'],
  },
  {
    id: 'fullstack',
    name: 'FullstackAI',
    description: 'Implementa Services e API Routes',
    icon: Zap,
    status: 'idle',
    capabilities: ['Service pattern', 'API implementation', 'Type safety'],
  },
];

export function AgentSwarmControl() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');

  const handleExecuteTask = async () => {
    if (!selectedAgent || !taskInput.trim()) return;

    setIsExecuting(true);
    setExecutionResult('');

    try {
      // TODO: Integrate with backend agent orchestration
      // await fetch('/api/admin/agents/execute', {
      //   method: 'POST',
      //   body: JSON.stringify({ agentId: selectedAgent, task: taskInput }),
      // });

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setExecutionResult(
        `[${agents.find((a) => a.id === selectedAgent)?.name}]\n\n` +
          `Tarefa executada com sucesso.\n\n` +
          `Input: ${taskInput.slice(0, 100)}...\n\n` +
          `Output: Task processed. Aguardando implementação real do backend.`
      );
    } catch (error) {
      setExecutionResult(`Erro ao executar: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    const variants = {
      idle: 'secondary',
      processing: 'default',
      success: 'default',
      error: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-auto">
        {status === 'idle' && 'Ocioso'}
        {status === 'processing' && 'Processando...'}
        {status === 'success' && 'Sucesso'}
        {status === 'error' && 'Erro'}
      </Badge>
    );
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>Controle do Enxame de Agentes</CardTitle>
        </div>
        <CardDescription>
          Orquestre agentes especializados para auditoria, refactoring e
          governança
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="execute">Executar Tarefa</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedAgent === agent.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{agent.name}</h4>
                          {getStatusBadge(agent.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.capabilities.map((cap) => (
                            <Badge
                              key={cap}
                              variant="outline"
                              className="text-xs"
                            >
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {getStatusIcon(agent.status)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            {!selectedAgent ? (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um agente na aba &quot;Agentes&quot; para começar
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Agente Selecionado:{' '}
                    <span className="text-primary">
                      {agents.find((a) => a.id === selectedAgent)?.name}
                    </span>
                  </label>
                  <Textarea
                    placeholder="Descreva a tarefa para o agente executar...&#10;&#10;Exemplo: 'Audite todos os layouts e verifique se estão usando DashboardShell'"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleExecuteTask}
                  disabled={isExecuting || !taskInput.trim()}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Executar Tarefa
                    </>
                  )}
                </Button>

                {executionResult && (
                  <Card className="border-2 bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Resultado da Execução
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {executionResult}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
