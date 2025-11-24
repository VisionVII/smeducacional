'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { BookOpen, GraduationCap, Award, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </Link>
          
          <nav className="hidden sm:flex gap-4 md:gap-6 items-center">
            <Link href="/courses" className="text-sm md:text-base hover:text-primary transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="text-sm md:text-base hover:text-primary transition-colors">
              Sobre
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>

            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center flex-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
          Aprenda no seu ritmo,<br />conquiste seus objetivos
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          Plataforma completa de ensino com cursos, certificados e acompanhamento personalizado
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
          <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/about">Saiba Mais</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
          Por que escolher a SM Educacional?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Cursos Completos</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Aulas em vídeo, materiais extras e exercícios práticos
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <Award className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Certificados</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Certificado digital ao concluir cada curso
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Suporte Dedicado</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Professores disponíveis para tirar suas dúvidas
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
