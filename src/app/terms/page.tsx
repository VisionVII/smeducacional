'use client';

import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

export default function TermsPage() {
  const { t, mounted } = useTranslations();

  const sections = mounted
    ? t.publicPages.terms.sections
    : [
        {
          title: 'Aceitação dos Termos',
          body: [
            'Ao acessar e usar a plataforma, você concorda com estes termos e condições de uso.',
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
                {mounted ? t.publicPages.terms.title : 'Termos de Uso'}
              </h1>
              <p className="text-xl opacity-90">
                {mounted
                  ? t.publicPages.terms.lastUpdated
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
                </div>
              ))}

              <div className="space-y-2">
                <h2>
                  {sections.length + 1}.{' '}
                  {mounted ? t.publicPages.terms.contact.title : 'Contato'}
                </h2>
                <p>
                  {mounted
                    ? t.publicPages.terms.contact.description
                    : 'Para questões sobre estes termos, entre em contato.'}
                </p>
                <p className="font-semibold">
                  {mounted
                    ? t.publicPages.terms.contact.email
                    : 'juridico@smeducacional.com'}
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
