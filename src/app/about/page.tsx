import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a SM Educacional
            </h1>
            <p className="text-xl opacity-90">
              Transformando vidas através da educação de qualidade e acessível
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
              <p className="text-gray-600">
                Democratizar o acesso à educação de qualidade, oferecendo cursos
                online que capacitem profissionais e transformem carreiras em
                todo o Brasil.
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nossa Visão</h2>
              <p className="text-gray-600">
                Ser referência em educação online no Brasil, reconhecida pela
                excelência dos cursos e pelo impacto positivo na vida dos
                nossos alunos.
              </p>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">10k+</div>
              <div className="text-gray-600">Alunos</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Cursos</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">5k+</div>
              <div className="text-gray-600">Certificados</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Excelência</h3>
                <p className="text-gray-600">
                  Buscamos sempre a mais alta qualidade em nossos cursos e
                  atendimento.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Inovação</h3>
                <p className="text-gray-600">
                  Utilizamos tecnologia de ponta para proporcionar a melhor
                  experiência de aprendizado.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Inclusão</h3>
                <p className="text-gray-600">
                  Acreditamos que educação de qualidade deve estar ao alcance
                  de todos.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de alunos que já transformaram suas carreiras
            com nossos cursos.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/courses">Ver Cursos</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
