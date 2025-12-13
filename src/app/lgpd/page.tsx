import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { PublicNavbar } from '@/components/public-navbar';
import { Footer } from '@/components/footer';
import { Shield, Database, User, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política LGPD | VisionVII',
  description:
    'Informações sobre coleta, tratamento e proteção de dados conforme LGPD',
};

export default function LGPDPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-16 h-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Proteção de Dados - LGPD
              </h1>
              <p className="text-xl opacity-90">
                Transparência, segurança e conformidade com a Lei Geral de
                Proteção de Dados
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 1. Coleta de Dados */}
            <Card className="p-8">
              <div className="flex gap-4 mb-6">
                <Database className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <h2 className="text-2xl font-bold">1. Coleta de Dados</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Coletamos dados pessoais apenas quando necessário para
                  fornecer nossos serviços. A coleta é feita de forma
                  transparente e com seu consentimento explícito.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg space-y-3">
                  <h3 className="font-semibold text-foreground">
                    📋 Dados Coletados no Cadastro:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Nome completo</strong> — Identificação do
                        usuário
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Email</strong> — Comunicação, autenticação e
                        recuperação de senha
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Senha (hasheada)</strong> — Autenticação segura
                        (nunca armazenamos em texto plano)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Perfil do usuário</strong> — Aluno, Professor ou
                        Admin (necessário para controle de acesso)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Progresso em cursos</strong> — Aulas assistidas,
                        exercícios realizados, notas (necessário para acompanhar
                        aprendizado)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Dados de pagamento</strong> — Para processamento
                        de transações e emissão de notas fiscais (processado por
                        Stripe, nunca temos acesso às informações completas)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        <strong>Localização aproximada (IP)</strong> — Para
                        segurança, detecção de fraude e compliance
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg space-y-3">
                  <h3 className="font-semibold text-foreground">
                    📊 Dados Coletados Automaticamente:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Logs de acesso</strong> — Quando você entra,
                        qual página visitou, quanto tempo permaneceu
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Cookies e tokens</strong> — Para manter sua
                        sessão segura
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Tipo de dispositivo e navegador</strong> — Para
                        otimizar experiência e detectar atividades suspeitas
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 2. Finalidade da Coleta */}
            <Card className="p-8">
              <div className="flex gap-4 mb-6">
                <Eye className="w-8 h-8 text-green-600 flex-shrink-0" />
                <h2 className="text-2xl font-bold">
                  2. Por Que Coletamos Esses Dados?
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-green-600 pl-4 py-2">
                    <h3 className="font-semibold mb-2">📚 Para Alunos</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Acompanhar seu progresso nos cursos</li>
                      <li>• Gerar certificados de conclusão</li>
                      <li>• Enviar notificações e lembretes</li>
                      <li>• Personalizar sua experiência de aprendizado</li>
                      <li>• Exibir anúncios estratégicos (plano free)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h3 className="font-semibold mb-2">👨‍🏫 Para Professores</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Gerenciar seus cursos e alunos</li>
                      <li>• Processar pagamentos por aluno matriculado</li>
                      <li>• Enviar relatórios de desempenho</li>
                      <li>• Controlar acesso a anúncios na plataforma</li>
                      <li>• Gerar extratos e notas fiscais</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h3 className="font-semibold mb-2">
                      🔧 Para Administradores
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Monitorar saúde da plataforma</li>
                      <li>• Detectar fraudes e abuso</li>
                      <li>• Gerar relatórios analíticos</li>
                      <li>• Gerenciar pagamentos e receitas</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4 py-2">
                    <h3 className="font-semibold mb-2">
                      🔒 Conformidade Legal
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cumprir obrigações legais</li>
                      <li>• Emitir recibos e notas fiscais</li>
                      <li>• Manter registros contábeis</li>
                      <li>• Prevenir atividades ilícitas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Compartilhamento de Dados */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                3. Compartilhamento de Dados - Hierarquia de Acesso
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">
                    ⚠️ O que NÃO compartilhamos:
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>
                      ✗ Senhas (nunca, em hipótese alguma - armazenadas com
                      hash)
                    </li>
                    <li>
                      ✗ Dados de cartão de crédito (processados apenas por
                      Stripe)
                    </li>
                    <li>✗ Dados pessoais com terceiros não autorizados</li>
                    <li>✗ Informações de saúde ou sensíveis</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">
                    ✅ O que compartilhamos (com fins legítimos):
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="border-l-4 border-green-600 pl-4">
                      <p className="font-semibold text-foreground">
                        Admin recebe:
                      </p>
                      <p className="text-muted-foreground">
                        • Dados de pagamento dos professores (para controle de
                        receita)
                        <br />
                        • Relatórios de atividade (segurança, fraude)
                        <br />• Estatísticas de plataforma
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-600 pl-4">
                      <p className="font-semibold text-foreground">
                        Professor recebe:
                      </p>
                      <p className="text-muted-foreground">
                        • Nome do aluno matriculado (para comunicação)
                        <br />
                        • Progresso e desempenho do aluno (para avaliação)
                        <br />• Dados de pagamento do aluno (para emissão de
                        recibos)
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <p className="font-semibold text-foreground">
                        Aluno recebe:
                      </p>
                      <p className="text-muted-foreground">
                        • Seu próprio progresso e desempenho
                        <br />
                        • Certificados de conclusão
                        <br />• Relatórios de aprendizado
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">
                    🔗 Serviços Terceirizados (Processadores):
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>
                      <strong>Stripe</strong> — Processamento de pagamentos
                      (nunca temos acesso às informações completas)
                    </li>
                    <li>
                      <strong>Supabase/PostgreSQL</strong> — Armazenamento
                      seguro de dados (banco de dados)
                    </li>
                    <li>
                      <strong>Resend</strong> — Envio de emails transacionais
                      (confirmação, recuperação de senha)
                    </li>
                    <li>
                      <strong>Vercel</strong> — Hospedagem e deploy da aplicação
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 4. Sistema de Anúncios */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                4. Sistema de Anúncios e Monetização
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Para oferecer cursos de qualidade com preços acessíveis,
                  implementamos um sistema de anúncios estratégicos que gera
                  receita para a plataforma e professores.
                </p>

                <div className="border rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      📺 Onde aparecem anúncios?
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>
                        • <strong>Vídeos de aulas</strong> — Antes de iniciar
                        (5-10s) e pausas estratégicas (15-30s)
                      </li>
                      <li>
                        • <strong>Banners laterais</strong> — Nas páginas de
                        curso e dashboard
                      </li>
                      <li>
                        • <strong>Anúncios intersticiais</strong> — Entre seções
                        de aula (apenas plano free)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      ✨ Diferença entre planos:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-red-300 rounded p-4 bg-red-50 dark:bg-red-950">
                        <p className="font-semibold text-foreground mb-3">
                          📱 Plano Free (Aluno)
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>✓ Acesso a cursos</li>
                          <li>
                            ✗ <strong>Com anúncios</strong>
                          </li>
                          <li>✗ Sem certificado</li>
                          <li>✗ Sem suporte</li>
                        </ul>
                      </div>

                      <div className="border border-green-300 rounded p-4 bg-green-50 dark:bg-green-950">
                        <p className="font-semibold text-foreground mb-3">
                          ⭐ Plano Premium (Professor)
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>✓ Acesso completo</li>
                          <li>
                            ✓ <strong>SEM anúncios</strong>
                          </li>
                          <li>✓ Certificado emitido</li>
                          <li>✓ Suporte prioritário</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      💰 Como funciona a receita?
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Modelo de 3 camadas:</strong>
                      </p>
                      <div className="ml-4 space-y-2">
                        <div className="flex gap-2">
                          <span className="font-bold text-orange-600">1.</span>
                          <span>
                            <strong>Aluno paga professor:</strong> Aluno acessa
                            curso do professor e pode pagar por ele
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold text-purple-600">2.</span>
                          <span>
                            <strong>Professor paga admin:</strong> Professor
                            paga taxa para ter plano premium (sem anúncios)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold text-blue-600">3.</span>
                          <span>
                            <strong>Anúncios geram receita:</strong> Admin
                            recebe de anunciantes por impressões e cliques em
                            alunos free
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 5. Consentimento e Cookies */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                5. Consentimento e Cookies
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Você controla quais dados deseja compartilhar. Ao se
                  cadastrar, você concorda com esta política. Pode revogar
                  consentimento a qualquer momento deletando sua conta.
                </p>

                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950 space-y-3">
                  <p className="font-semibold text-foreground">
                    🍪 Cookies utilizados:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>
                      <strong className="text-foreground">
                        next-auth.session-token
                      </strong>{' '}
                      — Mantém você autenticado (essencial)
                    </li>
                    <li>
                      <strong className="text-foreground">
                        __Secure-next-auth.session-token
                      </strong>{' '}
                      — Versão segura em HTTPS (essencial)
                    </li>
                    <li>
                      <strong className="text-foreground">analytics</strong> —
                      Acompanha visitantes de forma anônima (opcional)
                    </li>
                    <li>
                      <strong className="text-foreground">ad_preference</strong>{' '}
                      — Personaliza anúncios (opcional)
                    </li>
                  </ul>
                  <p className="text-xs mt-3">
                    Você pode desativar cookies nas configurações do navegador,
                    mas isso pode afetar sua experiência.
                  </p>
                </div>
              </div>
            </Card>

            {/* 6. Direitos do Usuário */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                6. Seus Direitos Sob LGPD
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Você tem direitos garantidos pela Lei Geral de Proteção de
                  Dados:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <p className="font-semibold mb-2">✔️ Direito de Acesso</p>
                    <p className="text-sm text-muted-foreground">
                      Solicitar uma cópia de todos os seus dados coletados
                    </p>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4 py-2">
                    <p className="font-semibold mb-2">
                      ✔️ Direito de Retificação
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Corrigir dados incorretos ou incompletos
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <p className="font-semibold mb-2">
                      ✔️ Direito de Apagamento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deletar sua conta e todos os dados (exceto obrigações
                      legais)
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4 py-2">
                    <p className="font-semibold mb-2">
                      ✔️ Direito à Portabilidade
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Transferir seus dados para outro serviço
                    </p>
                  </div>

                  <div className="border-l-4 border-red-600 pl-4 py-2">
                    <p className="font-semibold mb-2">
                      ✔️ Direito de Contestação
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contestar o processamento de seus dados
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-600 pl-4 py-2">
                    <p className="font-semibold mb-2">
                      ✔️ Direito de Consentimento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Revogar consentimento de uso de dados a qualquer momento
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Para exercer qualquer desses direitos, entre em contato
                    conosco em:{' '}
                    <a
                      href="mailto:privacidade@visionvii.com"
                      className="text-primary hover:underline font-medium"
                    >
                      privacidade@visionvii.com
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            {/* 7. Segurança de Dados */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                7. Como Protegemos Seus Dados
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>HTTPS/TLS</strong> — Toda comunicação é
                      criptografada em trânsito
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>Senhas hasheadas</strong> — Com bcrypt, imposível
                      recuperar senha original
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>JWT tokens</strong> — Sessões seguras e sem estado
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>Rate limiting</strong> — Proteção contra ataques
                      de força bruta
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>Content Security Policy</strong> — Proteção contra
                      XSS e injeção
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>Monitoramento 24/7</strong> — Detecção de
                      atividades suspeitas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>Backups automáticos</strong> — Recuperação em caso
                      de emergência
                    </span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* 8. Alterações na Política */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                8. Alterações nesta Política
              </h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Alterações
                significativas serão comunicadas por email. Sua continuação no
                uso do serviço indica aceitação das mudanças.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                <strong>Última atualização:</strong> 13 de dezembro de 2025
              </p>
            </Card>

            {/* 9. Contato */}
            <Card className="p-8 bg-primary/5">
              <h2 className="text-2xl font-bold mb-6">
                9. Dúvidas? Fale Conosco
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Se tiver dúvidas sobre LGPD, privacidade ou proteção de dados,
                  entre em contato:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">
                      📧 Email de Privacidade
                    </p>
                    <a
                      href="mailto:privacidade@visionvii.com"
                      className="text-primary hover:underline"
                    >
                      privacidade@visionvii.com
                    </a>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-2">
                      📧 Suporte Geral
                    </p>
                    <a
                      href="mailto:suporte@smeducacional.com.br"
                      className="text-primary hover:underline"
                    >
                      suporte@smeducacional.com.br
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
