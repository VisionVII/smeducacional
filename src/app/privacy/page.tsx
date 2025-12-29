'use client';

import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

export default function PrivacyPage() {
  const { t, mounted } = useTranslations();

  const sections = mounted
    ? t.publicPages.privacy.sections
    : [
        {
          title: 'Introdução',
          body: [
            'Explicamos como coletamos, usamos e protegemos suas informações pessoais.',
          ],
        },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <AdaptiveNavbar />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {mounted
                  ? t.publicPages.privacy.title
                  : 'Política de Privacidade'}
              </h1>
              <p className="text-xl opacity-90">
                {mounted
                  ? t.publicPages.privacy.lastUpdated
                  : 'Última atualização: 2 de dezembro de 2025'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12">
            <div className="prose max-w-none">
              {sections.map((section, index) => (
                <div key={section.title} className="space-y-2">
                  <h2>
                    {index + 1}. {section.title}
                  </h2>
                  {section.body?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.subsections?.map((sub) => (
                    <div key={sub.title} className="space-y-1">
                      <h3>{sub.title}</h3>
                      <ul>
                        {sub.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}

              <div className="space-y-2">
                <h2>
                  {sections.length + 1}.{' '}
                  {mounted ? t.publicPages.privacy.contact.title : 'Contato'}
                </h2>
                <p>
                  {mounted
                    ? t.publicPages.privacy.contact.description
                    : 'Para questões sobre privacidade ou exercer seus direitos, entre em contato:'}
                </p>
                <ul>
                  <li>
                    {mounted
                      ? t.publicPages.privacy.contact.email
                      : 'privacidade@smeducacional.com'}
                  </li>
                  <li>
                    {mounted
                      ? t.publicPages.privacy.contact.phone
                      : '(11) 1234-5678'}
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  {mounted
                    ? t.publicPages.privacy.contact.dpo
                    : 'DPO: dpo@smeducacional.com'}
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
