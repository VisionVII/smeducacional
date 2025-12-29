'use client';

import { useMemo } from 'react';
import { useTranslations } from '@/hooks/use-translations';

export default function CookiesPage() {
  const { t, mounted } = useTranslations();

  const sections = useMemo(
    () =>
      mounted
        ? t.publicPages.cookies.sections
        : [
            {
              title: 'O que são cookies?',
              description:
                'Cookies são pequenos arquivos de texto armazenados no seu dispositivo para ajudar sites a funcionarem.',
            },
          ],
    [mounted, t]
  );

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">
        {mounted ? t.publicPages.cookies.title : 'Política de Cookies'}
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {section.description}
            </p>

            {section.items && (
              <div className="space-y-4 mt-4">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="border-l-4 border-primary/60 pl-4"
                  >
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    {item.list && (
                      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                        {item.list.map((li) => (
                          <li key={li}>{li}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.list && (
              <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-2">
                {section.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}

            {section.callout && (
              <div className="bg-muted p-4 rounded-lg mt-4 space-y-2">
                <h3 className="font-semibold">{section.callout.title}</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {section.callout.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {mounted
              ? t.publicPages.cookies.updates.title
              : 'Atualizações desta política'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {mounted
              ? t.publicPages.cookies.updates.description
              : 'Podemos atualizar esta política periodicamente. Recomendamos revisar esta página para se manter informado.'}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {mounted
              ? t.publicPages.cookies.updates.lastUpdated
              : 'Última atualização: 2025'}
          </p>
        </section>
      </div>
    </div>
  );
}
