import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Central de Ajuda | VisionVII',
  description: 'Encontre respostas para suas dúvidas',
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Como podemos ajudar?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estamos aqui para responder suas dúvidas e garantir a melhor
          experiência
        </p>
      </section>

      {/* Contact Options */}
      <section className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
        <div className="text-center p-6 border rounded-lg">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-muted-foreground mb-4">
            Envie suas dúvidas por email
          </p>
          <a
            href="mailto:visiondevgrid@proton.me"
            className="text-primary hover:underline"
          >
            visiondevgrid@proton.me
          </a>
        </div>

        <div className="text-center p-6 border rounded-lg">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Chat ao vivo</h3>
          <p className="text-muted-foreground mb-4">
            Fale com nosso time em tempo real
          </p>
          <Button variant="outline">Iniciar chat</Button>
        </div>

        <div className="text-center p-6 border rounded-lg">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Base de conhecimento</h3>
          <p className="text-muted-foreground mb-4">
            Artigos e tutoriais detalhados
          </p>
          <Button variant="outline">Ver artigos</Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Perguntas frequentes
        </h2>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como faço para me matricular em um curso?
            </h3>
            <p className="text-muted-foreground">
              Navegue pelo catálogo de cursos, selecione o curso desejado e
              clique em "Matricular-se". Você será direcionado para o pagamento
              ou poderá acessar imediatamente se o curso for gratuito.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como me tornar um instrutor?
            </h3>
            <p className="text-muted-foreground">
              Clique em{' '}
              <Link
                href="/become-instructor"
                className="text-primary hover:underline"
              >
                "Torne-se um instrutor"
              </Link>{' '}
              e siga o processo de cadastro. Após aprovação, você terá acesso à
              plataforma de criação de cursos.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como acompanho meu progresso?
            </h3>
            <p className="text-muted-foreground">
              Acesse seu dashboard de aluno para visualizar todos os cursos
              matriculados, seu progresso em cada um e os certificados
              conquistados.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Posso baixar os vídeos das aulas?
            </h3>
            <p className="text-muted-foreground">
              Os vídeos são disponibilizados para streaming online. O download
              de materiais complementares (PDFs, slides) está disponível quando
              fornecido pelo instrutor.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como funciona o certificado?
            </h3>
            <p className="text-muted-foreground">
              Ao concluir 100% de um curso, você automaticamente recebe um
              certificado digital que pode ser baixado e compartilhado no
              LinkedIn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
