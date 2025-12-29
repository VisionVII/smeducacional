'use client';

import {
  Shield,
  Database,
  Eye,
  Share2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

const iconMap = {
  database: Database,
  purposes: Eye,
  sharing: Share2,
  security: Lock,
  rights: CheckCircle2,
} as const;

const fallbackSections = [
  {
    icon: 'database',
    title: 'Coleta de Dados',
    description:
      'Coletamos apenas os dados necessários para operar a plataforma, sempre com consentimento e transparência.',
    bullets: [
      'Dados de cadastro: nome, email, senha hasheada, role',
      'Dados de uso: IP aproximado, dispositivo, progresso em cursos',
      'Dados de pagamento processados por terceiros (Stripe)',
    ],
  },
  {
    icon: 'purposes',
    title: 'Finalidade do Tratamento',
    description:
      'Utilizamos os dados para entregar cursos, emitir certificados e manter a segurança.',
    bullets: [
      'Autenticação e autorização por role',
      'Comunicação transacional (emails de conta)',
      'Analytics para melhorar a plataforma',
    ],
  },
  {
    icon: 'sharing',
    title: 'Compartilhamento Controlado',
    description:
      'Compartilhamos dados somente com provedores essenciais e sempre com contratos de proteção.',
    groups: [
      {
        title: 'Provedores',
        items: [
          'Stripe: processamento de pagamentos',
          'Supabase/PostgreSQL: base de dados e storage',
          'Resend: envio de emails transacionais',
          'Vercel: hospedagem e deploy',
        ],
      },
    ],
  },
  {
    icon: 'security',
    title: 'Segurança e Retenção',
    description:
      'Aplicamos criptografia, controle de acesso por role, logs e backups. Retemos dados apenas pelo tempo necessário e obrigações legais.',
    bullets: [
      'Senhas sempre hasheadas (bcrypt)',
      'Tokens seguros (__Secure-next-auth.session-token)',
      'Backups regulares e monitoramento de vulnerabilidades',
    ],
  },
  {
    icon: 'rights',
    title: 'Seus Direitos (LGPD)',
    description:
      'Você pode acessar, corrigir, portar ou excluir seus dados. Também pode revogar consentimento quando aplicável.',
    bullets: [
      'Acesso e portabilidade',
      'Retificação ou exclusão de dados',
      'Oposição e limitação de processamento',
    ],
  },
];

export default function LGPDPage() {
  const { t, mounted } = useTranslations();
  const sections = mounted ? t.publicPages.lgpd.sections : fallbackSections;

  return (
    <div className="min-h-screen flex flex-col">
      <AdaptiveNavbar />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="flex justify-center">
                <Shield className="w-16 h-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {mounted
                  ? t.publicPages.lgpd.hero.title
                  : 'Proteção de Dados - LGPD'}
              </h1>
              <p className="text-xl opacity-90">
                {mounted
                  ? t.publicPages.lgpd.hero.subtitle
                  : 'Transparência, segurança e conformidade com a Lei Geral de Proteção de Dados'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section) => {
              const Icon =
                iconMap[section.icon as keyof typeof iconMap] || Shield;

              return (
                <Card key={section.title} className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-7 h-7 text-primary" />
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  {section.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  )}

                  {section.bullets && (
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {section.bullets.map((item: string) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {section.groups && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {section.groups.map(
                        (group: { title: string; items: string[] }) => (
                          <div
                            key={group.title}
                            className="border-l-4 border-primary/60 pl-4 space-y-2"
                          >
                            <p className="font-semibold text-foreground">
                              {group.title}
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {group.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            <Card className="p-8 space-y-3">
              <h2 className="text-2xl font-bold">
                {mounted ? t.publicPages.lgpd.contact.title : 'Contato do DPO'}
              </h2>
              <p className="text-muted-foreground">
                {mounted
                  ? t.publicPages.lgpd.contact.description
                  : 'Fale conosco para exercer seus direitos ou tirar dúvidas.'}
              </p>
              <p className="font-semibold">
                {mounted
                  ? t.publicPages.lgpd.contact.email
                  : 'dpo@smeducacional.com'}
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
