'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, TrendingUp, GitBranch } from 'lucide-react';

export function DevTools() {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4" />
          Ferramentas do Desenvolvedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleNavigation('/admin/dev/database')}
          >
            <Database className="h-4 w-4 mr-2" />
            Banco de Dados
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleNavigation('/admin/dev/logs')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Logs do Sistema
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleNavigation('/admin/dev/metrics')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Métricas
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleNavigation('/admin/dev/github')}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
