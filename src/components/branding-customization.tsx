'use client';

import { useState } from 'react';
import { useCanAccess, FeatureGate, usePlanInfo } from '@/hooks/useCanAccess';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';

/**
 * Componente de Branding & Customização
 * Demonstra feature gating em ação
 * Features desbloqueadas baseado no plano do professor
 */
export function BrandingCustomization() {
  const { access, loading, error } = useCanAccess();
  const planInfo = usePlanInfo();
  const [uploading, setUploading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Carregando informações do plano...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Status do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Plano</CardTitle>
          <CardDescription>Seu plano atual e data de expiração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plano</p>
              <p className="text-lg font-semibold capitalize">
                {planInfo.plan}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center gap-2">
                {planInfo.isActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">Ativo</span>
                  </>
                ) : planInfo.isTrial ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-600">Trial</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-600">Inativo</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {planInfo.daysUntilExpiry !== null && (
            <div className="text-sm text-gray-600">
              {planInfo.isActive || planInfo.isTrial ? (
                <p>Vence em {planInfo.daysUntilExpiry} dias</p>
              ) : (
                <p>
                  Plano expirado em{' '}
                  {planInfo.subscriptionExpiresAt?.toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {!planInfo.isActive && !planInfo.isTrial && (
            <Button
              className="w-full"
              onClick={() => (window.location.href = '/upgrade')}
            >
              Fazer Upgrade
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Feature: Upload de Logo */}
      <FeatureGate
        feature="canUploadLogo"
        fallback={
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Upload de Logo
                </CardTitle>
              </div>
              <CardDescription>
                Recurso disponível apenas no plano Basic ou superior
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Upload de Logo
              </CardTitle>
            </div>
            <CardDescription>
              Personalize sua página com seu logo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                className="hidden"
                id="logo-upload"
                onChange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  if (!file) return;

                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/teacher/branding/logo', {
                      method: 'POST',
                      body: formData,
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      alert(`Erro: ${error.message || error.error}`);
                    } else {
                      alert('Logo enviado com sucesso!');
                    }
                  } catch (err) {
                    console.error('Upload error:', err);
                    alert('Erro ao enviar arquivo');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <p className="text-gray-600 mb-2">
                  Clique para selecionar ou arraste seu logo
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WebP ou SVG (máx 2MB)
                </p>
              </label>
            </div>
            <Button
              disabled={uploading}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {uploading ? 'Enviando...' : 'Enviar Logo'}
            </Button>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Feature: Customizar Domínio */}
      <FeatureGate
        feature="canCustomizeDomain"
        fallback={
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Domínio Customizado
                </CardTitle>
              </div>
              <CardDescription>
                Recurso disponível apenas no plano Premium
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Domínio Customizado
            </CardTitle>
            <CardDescription>
              Use seu próprio domínio para a página de cursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Conecte seu domínio pessoal para uma experiência profissional
            </p>
            <Button variant="outline">Configurar Domínio</Button>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Feature: Analytics Avançado */}
      <FeatureGate
        feature="canAccessAnalytics"
        fallback={
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Analytics Avançado
                </CardTitle>
              </div>
              <CardDescription>
                Recurso disponível a partir do plano Basic
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Analytics Avançado
            </CardTitle>
            <CardDescription>
              Relatórios detalhados sobre engajamento dos alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Ver Analytics</Button>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Tabela de Features por Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Free</th>
                  <th className="text-center py-2">Basic</th>
                  <th className="text-center py-2">Premium</th>
                  <th className="text-center py-2">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Upload de Logo',
                    free: false,
                    basic: true,
                    premium: true,
                    enterprise: true,
                  },
                  {
                    name: 'Domínio Customizado',
                    free: false,
                    basic: false,
                    premium: true,
                    enterprise: true,
                  },
                  {
                    name: 'Analytics',
                    free: false,
                    basic: true,
                    premium: true,
                    enterprise: true,
                  },
                  {
                    name: 'Upload de Vídeo',
                    free: true,
                    basic: true,
                    premium: true,
                    enterprise: true,
                  },
                  {
                    name: 'Criar Cursos',
                    free: true,
                    basic: true,
                    premium: true,
                    enterprise: true,
                  },
                  {
                    name: 'Max Alunos',
                    free: '10',
                    basic: '50',
                    premium: '300',
                    enterprise: '10k',
                  },
                  {
                    name: 'Storage',
                    free: '1GB',
                    basic: '10GB',
                    premium: '100GB',
                    enterprise: '1TB',
                  },
                ].map((row) => (
                  <tr key={row.name} className="border-b">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )
                      ) : (
                        row.basic
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )
                      ) : (
                        row.premium
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
