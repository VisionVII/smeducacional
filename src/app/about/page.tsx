'use client';

import Link from 'next/link';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { AdaptiveNavbar } from '@/components/adaptive-navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

export default function AboutPage() {
  const { t, mounted } = useTranslations();

  const stats = [
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      value: mounted ? t.publicPages.about.stats.students.value : '10k+',
      label: mounted ? t.publicPages.about.stats.students.label : 'Alunos',
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      value: mounted ? t.publicPages.about.stats.courses.value : '50+',
      label: mounted ? t.publicPages.about.stats.courses.label : 'Cursos',
    },
    {
      icon: <Award className="w-12 h-12 text-blue-600" />,
      value: mounted ? t.publicPages.about.stats.certificates.value : '5k+',
      label: mounted
        ? t.publicPages.about.stats.certificates.label
        : 'Certificados',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
      value: mounted ? t.publicPages.about.stats.satisfaction.value : '95%',
      label: mounted
        ? t.publicPages.about.stats.satisfaction.label
        : 'Satisfação',
    },
  ];

  const values = mounted
    ? t.publicPages.about.values
    : [
        {
          title: 'Excelência',
          description:
            'Buscamos sempre a mais alta qualidade em nossos cursos e atendimento.',
        },
        {
          title: 'Inovação',
          description:
            'Utilizamos tecnologia de ponta para proporcionar a melhor experiência de aprendizado.',
        },
        {
          title: 'Inclusão',
          description:
            'Acreditamos que educação de qualidade deve estar ao alcance de todos.',
        },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <AdaptiveNavbar />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {mounted
                  ? t.publicPages.about.hero.title
                  : 'Sobre a SM Educacional'}
              </h1>
              <p className="text-xl opacity-90">
                {mounted
                  ? t.publicPages.about.hero.subtitle
                  : 'Transformando vidas através da educação de qualidade e acessível'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  {mounted ? t.publicPages.about.mission.title : 'Nossa Missão'}
                </h2>
                <p className="text-gray-600">
                  {mounted
                    ? t.publicPages.about.mission.description
                    : 'Democratizar o acesso à educação de qualidade, oferecendo cursos online que capacitem profissionais e transformem carreiras em todo o Brasil.'}
                </p>
              </Card>

              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  {mounted ? t.publicPages.about.vision.title : 'Nossa Visão'}
                </h2>
                <p className="text-gray-600">
                  {mounted
                    ? t.publicPages.about.vision.description
                    : 'Ser referência em educação online, reconhecida pela excelência dos cursos e pelo impacto positivo na vida dos nossos alunos.'}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {item.value}
                  </div>
                  <div className="text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">
                {mounted ? t.publicPages.about.valuesTitle : 'Nossos Valores'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {values.map((value) => (
                  <Card key={value.title} className="p-6">
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {mounted
                ? t.publicPages.about.cta.title
                : 'Pronto para começar sua jornada?'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {mounted
                ? t.publicPages.about.cta.subtitle
                : 'Junte-se a milhares de alunos que já transformaram suas carreiras com nossos cursos.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/courses">
                  {mounted ? t.publicPages.about.cta.viewCourses : 'Ver Cursos'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">
                  {mounted
                    ? t.publicPages.about.cta.createAccount
                    : 'Criar Conta'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
