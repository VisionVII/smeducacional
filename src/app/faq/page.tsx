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
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Geral',
    questions: [
      {
        question: 'Como faço para me matricular em um curso?',
        answer:
          "Para se matricular em um curso, primeiro crie sua conta ou faça login. Depois, navegue até a página do curso desejado e clique no botão 'Matricular-se'. Alguns cursos podem ser gratuitos, enquanto outros exigem pagamento.",
      },
      {
        question: 'Posso acessar os cursos pelo celular?',
        answer:
          'Sim! Nossa plataforma é totalmente responsiva e pode ser acessada de qualquer dispositivo: computador, tablet ou smartphone. Você pode estudar onde e quando quiser.',
      },
      {
        question: 'Quanto tempo tenho para concluir um curso?',
        answer:
          'Não há limite de tempo! Você pode estudar no seu próprio ritmo. Uma vez matriculado, o acesso ao curso é vitalício, permitindo que você revise o conteúdo sempre que precisar.',
      },
    ],
  },
  {
    category: 'Certificados',
    questions: [
      {
        question: 'Como obtenho meu certificado?',
        answer:
          "Após concluir 100% das aulas do curso, seu certificado será gerado automaticamente. Você pode acessá-lo e baixá-lo na página 'Meus Certificados' dentro da sua área de aluno.",
      },
      {
        question: 'O certificado é reconhecido?',
        answer:
          'Nossos certificados são digitais e comprovam a conclusão do curso na plataforma. Eles podem ser utilizados para comprovação de horas complementares, enriquecimento curricular e desenvolvimento profissional.',
      },
      {
        question: 'Posso imprimir o certificado?',
        answer:
          'Sim! O certificado é gerado em formato PDF, que pode ser facilmente impresso ou compartilhado digitalmente.',
      },
    ],
  },
  {
    category: 'Pagamentos',
    questions: [
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer:
          'Aceitamos cartões de crédito, débito e PIX. Os pagamentos são processados de forma segura através de plataformas confiáveis.',
      },
      {
        question: 'Existe política de reembolso?',
        answer:
          'Sim! Você tem até 7 dias após a compra para solicitar reembolso integral, conforme o Código de Defesa do Consumidor. Após esse período, analisamos casos específicos.',
      },
      {
        question: 'Os cursos têm mensalidade?',
        answer:
          'Não! Os cursos são vendidos com pagamento único. Uma vez adquirido, você tem acesso vitalício ao conteúdo, incluindo futuras atualizações.',
      },
    ],
  },
  {
    category: 'Suporte Técnico',
    questions: [
      {
        question: 'Estou com problemas para acessar as aulas, o que faço?',
        answer:
          'Primeiro, verifique sua conexão com a internet e tente atualizar a página. Se o problema persistir, limpe o cache do navegador ou tente acessar de outro dispositivo. Caso continue com dificuldades, entre em contato com nosso suporte.',
      },
      {
        question: 'Esqueci minha senha, como recupero?',
        answer:
          "Na página de login, clique em 'Esqueci minha senha'. Digite seu email cadastrado e você receberá um código de recuperação para criar uma nova senha.",
      },
      {
        question: 'Como entro em contato com o suporte?',
        answer:
          'Você pode entrar em contato através do email visiondevgrid@proton.me ou pelo sistema de mensagens dentro da plataforma. Nosso time responde em até 24 horas úteis.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto py-16 max-w-4xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
        <p className="text-xl text-muted-foreground">
          Encontre respostas para as dúvidas mais comuns
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, qIdx) => (
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
          <CardTitle>Não encontrou sua resposta?</CardTitle>
          <CardDescription>
            Entre em contato com nossa equipe de suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> visiondevgrid@proton.me
            </p>
            <p>
              <strong>Horário de atendimento:</strong> Segunda a Sexta, 9h às
              18h
            </p>
            <p className="text-muted-foreground">
              Respondemos todas as mensagens em até 24 horas úteis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
