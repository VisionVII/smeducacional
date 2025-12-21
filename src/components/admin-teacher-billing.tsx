'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import type { PlanType } from '@/lib/subscription';

interface TeacherBilling {
  userId: string;
  userEmail: string;
  userName: string;
  plan: PlanType;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
  canUploadLogo: boolean;
  canCustomizeDomain: boolean;
  canAccessAnalytics: boolean;
  maxStudents: number;
  maxStorageGB: number;
}

/**
 * Admin Page: Gerenciar Planos de Professores
 * Permite admin ativar/cancelar planos manualmente
 */
export function AdminTeacherBilling() {
  const [teachers, setTeachers] = useState<TeacherBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<PlanType>('basic');
  const [duration, setDuration] = useState('30');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const response = await fetch('/api/admin/teachers-billing');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivatePlan() {
    if (!selectedTeacher) return;

    setActivating(true);
    try {
      const response = await fetch('/api/admin/activate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          plan: newPlan,
          durationDays: parseInt(duration),
        }),
      });

      if (response.ok) {
        alert(`Plano ${newPlan} ativado com sucesso!`);
        fetchTeachers();
        setSelectedTeacher(null);
      } else {
        alert('Erro ao ativar plano');
      }
    } finally {
      setActivating(false);
    }
  }

  async function handleCancelPlan(teacherId: string) {
    if (!confirm('Tem certeza que deseja cancelar o plano?')) return;

    try {
      const response = await fetch('/api/admin/cancel-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId }),
      });

      if (response.ok) {
        alert('Plano cancelado');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error canceling plan:', error);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciar Planos de Professores</h2>
        <p className="text-gray-600">
          Ativar, cancelar e gerenciar subscriptions
        </p>
      </div>

      {/* Panel de Ativação Rápida */}
      {selectedTeacher && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Ativar Plano
            </CardTitle>
            <CardDescription>
              Professor:{' '}
              {teachers.find((t) => t.userId === selectedTeacher)?.userName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plano</label>
                <Select
                  value={newPlan}
                  onValueChange={(v) => setNewPlan(v as PlanType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duração (dias)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleActivatePlan}
                disabled={activating}
                className="flex-1"
              >
                {activating ? 'Ativando...' : 'Ativar Plano'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTeacher(null)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Professores */}
      <Card>
        <CardHeader>
          <CardTitle>Professores ({teachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-2">Nome</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-center py-2 px-2">Plano</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-center py-2 px-2">Expira</th>
                  <th className="text-right py-2 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {teachers?.map((teacher) => (
                  <tr
                    key={teacher.userId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 font-medium">
                      {teacher.userName}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {teacher.userEmail}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {teacher.plan}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {teacher.subscriptionStatus === 'active' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-xs">
                              Ativo
                            </span>
                          </>
                        ) : teacher.subscriptionStatus === 'trial' ? (
                          <>
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-600 text-xs">Trial</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600 text-xs">
                              Inativo
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-xs">
                      {teacher.subscriptionExpiresAt
                        ? new Date(
                            teacher.subscriptionExpiresAt
                          ).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant={
                            selectedTeacher === teacher.userId
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => setSelectedTeacher(teacher.userId)}
                        >
                          {selectedTeacher === teacher.userId
                            ? 'Editando...'
                            : 'Editar'}
                        </Button>
                        {teacher.subscriptionStatus !== 'inactive' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelPlan(teacher.userId)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              {teachers.filter((t) => t.subscriptionStatus === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Planos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              {teachers.filter((t) => t.plan === 'premium').length}
            </div>
            <p className="text-sm text-gray-600">Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              {teachers.filter((t) => t.plan === 'basic').length}
            </div>
            <p className="text-sm text-gray-600">Basic</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              {
                teachers.filter((t) => t.subscriptionStatus === 'inactive')
                  .length
              }
            </div>
            <p className="text-sm text-gray-600">Inativos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
