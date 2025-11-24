import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Award, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SM Educacional</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/courses" className="hover:text-primary transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Aprenda no seu ritmo,<br />conquiste seus objetivos
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma completa de ensino com cursos, certificados e acompanhamento personalizado
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">Saiba Mais</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Por que escolher a SM Educacional?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Cursos Completos</h3>
            <p className="text-muted-foreground">
              Aulas em vídeo, materiais extras e exercícios práticos
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Certificados</h3>
            <p className="text-muted-foreground">
              Certificado digital ao concluir cada curso
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Suporte Dedicado</h3>
            <p className="text-muted-foreground">
              Professores disponíveis para tirar suas dúvidas
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 SM Educacional. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
