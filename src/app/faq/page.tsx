'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import { HelpCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

import type { Translation } from '@/components/translations-provider';
type TranslationsObject = Translation;

const faqs = (t: TranslationsObject) => [
  {
    category: t.faq.categories.general,
    questions: [
      {
        question: t.faq.general.q1,
        answer: t.faq.general.a1,
      },
      {
        question: t.faq.general.q2,
        answer: t.faq.general.a2,
      },
      {
        question: t.faq.general.q3,
        answer: t.faq.general.a3,
      },
    ],
  },
  {
    category: t.faq.categories.certificates,
    questions: [
      {
        question: t.faq.certificates.q1,
        answer: t.faq.certificates.a1,
      },
      {
        question: t.faq.certificates.q2,
        answer: t.faq.certificates.a2,
      },
      {
        question: t.faq.certificates.q3,
        answer: t.faq.certificates.a3,
      },
    ],
  },
  {
    category: t.faq.categories.payments,
    questions: [
      {
        question: t.faq.payments.q1,
        answer: t.faq.payments.a1,
      },
      {
        question: t.faq.payments.q2,
        answer: t.faq.payments.a2,
      },
      {
        question: t.faq.payments.q3,
        answer: t.faq.payments.a3,
      },
    ],
  },
  {
    category: t.faq.categories.instructors,
    questions: [
      {
        question: t.faq.instructors.q1,
        answer: t.faq.instructors.a1,
      },
      {
        question: t.faq.instructors.q2,
        answer: t.faq.instructors.a2,
      },
      {
        question: t.faq.instructors.q3,
        answer: t.faq.instructors.a3,
      },
    ],
  },
  {
    category: t.faq.categories.support,
    questions: [
      {
        question: t.faq.support.q1,
        answer: t.faq.support.a1,
      },
      {
        question: t.faq.support.q2,
        answer: t.faq.support.a2,
      },
      {
        question: t.faq.support.q3,
        answer: t.faq.support.a3,
      },
    ],
  },
];

export default function FAQPage() {
  const { t, mounted } = useTranslations();
  const data = mounted ? faqs(t) : [];
  return (
    <div className="min-h-screen flex flex-col">
      <AdaptiveNavbar />

      <main className="flex-1">
        <div className="container mx-auto py-16 max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {mounted ? t.faq.title : 'Perguntas Frequentes'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {mounted
                ? t.faq.subtitle
                : 'Encontre respostas para as dúvidas mais comuns'}
            </p>
          </div>

          <div className="space-y-8">
            {(mounted ? data : [])?.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions?.map((faq, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>
                {mounted ? t.faq.notFoundTitle : 'Não encontrou sua resposta?'}
              </CardTitle>
              <CardDescription>
                {mounted
                  ? t.faq.notFoundSubtitle
                  : 'Entre em contato com nossa equipe de suporte'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>{mounted ? t.faq.supportEmail : 'Email'}:</strong>{' '}
                  visiondevgrid@proton.me
                </p>
                <p>
                  <strong>
                    {mounted ? t.faq.supportHours : 'Horário de atendimento'}:
                  </strong>{' '}
                  Segunda a Sexta, 9h às 18h
                </p>
                <p className="text-muted-foreground">
                  {mounted
                    ? t.faq.supportSLA
                    : 'Respondemos todas as mensagens em até 24 horas úteis'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
