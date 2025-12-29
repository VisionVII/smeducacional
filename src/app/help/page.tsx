'use client';

import Link from 'next/link';
import { Mail, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

export default function HelpPage() {
  const { t, mounted } = useTranslations();

  const contactMethods = mounted
    ? t.publicPages.help.contactMethods
    : [
        {
          title: 'Email',
          description: 'Envie suas dúvidas por email',
          action: 'visiondevgrid@proton.me',
        },
        {
          title: 'Chat ao vivo',
          description: 'Fale com nosso time em tempo real',
          action: 'Iniciar chat',
        },
        {
          title: 'Base de conhecimento',
          description: 'Artigos e tutoriais detalhados',
          action: 'Ver artigos',
        },
      ];

  const faqItems = mounted
    ? t.publicPages.help.faq
    : [
        {
          question: 'Como faço para me matricular em um curso?',
          answer: {
            prefix:
              'Navegue pelo catálogo de cursos, selecione o curso desejado e clique em "Matricular-se".',
            suffix: '',
          },
        },
      ];

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {mounted ? t.publicPages.help.hero.title : 'Como podemos ajudar?'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {mounted
            ? t.publicPages.help.hero.subtitle
            : 'Estamos aqui para responder suas dúvidas e garantir a melhor experiência'}
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
        {contactMethods.map((method, index) => {
          const icons = [Mail, MessageCircle, FileText];
          const Icon = icons[index] || Mail;

          return (
            <div
              key={method.title}
              className="text-center p-6 border rounded-lg"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
              <p className="text-muted-foreground mb-4">{method.description}</p>
              {method.link ? (
                <Link
                  href={method.link}
                  className="text-primary hover:underline inline-flex items-center justify-center"
                >
                  {method.action}
                </Link>
              ) : (
                <Button variant="outline" asChild={Boolean(method.href)}>
                  {method.href ? (
                    <a href={method.href}>{method.action}</a>
                  ) : (
                    <span>{method.action}</span>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          {mounted ? t.publicPages.help.faqTitle : 'Perguntas frequentes'}
        </h2>

        <div className="space-y-6">
          {faqItems.map((item) => (
            <div key={item.question} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
              <p className="text-muted-foreground">
                {item.answer.prefix}{' '}
                {item.answer.link ? (
                  <Link
                    href={item.answer.link.href}
                    className="text-primary hover:underline"
                  >
                    {item.answer.link.label}
                  </Link>
                ) : null}
                {item.answer.suffix}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
