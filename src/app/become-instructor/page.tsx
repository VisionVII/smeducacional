import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Torne-se um Instrutor | VisionVII',
  description: 'Compartilhe seu conhecimento e alcance milhares de alunos',
};

export default function BecomeInstructorPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Compartilhe seu conhecimento
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Junte-se a milhares de instrutores que estão transformando vidas
          através da educação online
        </p>
        <Link href="/register?role=TEACHER">
          <Button size="lg" className="text-lg">
            Começar agora
          </Button>
        </Link>
      </section>

      {/* Benefits Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Crie com facilidade</h3>
          <p className="text-muted-foreground">
            Ferramentas intuitivas para criar cursos profissionais em minutos
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Alcance milhares</h3>
          <p className="text-muted-foreground">
            Conecte-se com alunos de todo o Brasil em nossa plataforma
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ganhe renda</h3>
          <p className="text-muted-foreground">
            Monetize seu conhecimento e construa uma fonte de renda recorrente
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          O que você ganha como instrutor
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            'Plataforma completa de gerenciamento de cursos',
            'Upload ilimitado de vídeos e materiais',
            'Ferramentas de comunicação com alunos',
            'Relatórios detalhados de desempenho',
            'Suporte técnico dedicado',
            'Pagamentos seguros e automáticos',
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para começar sua jornada?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Crie sua conta gratuitamente e comece a construir seu primeiro curso
          hoje mesmo
        </p>
        <Link href="/register?role=TEACHER">
          <Button size="lg" className="text-lg">
            Cadastrar como instrutor
          </Button>
        </Link>
      </section>
    </div>
  );
}
