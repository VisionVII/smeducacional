'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Clock,
  Signal,
  Users,
  Search,
  GraduationCap,
  Loader2,
  TrendingUp,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { PublicThemeProvider } from '@/components/public-theme-provider';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  duration: number | null;
  level: string | null;
  price: number;
  isPaid: boolean;
  isPublished: boolean;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  instructor: {
    name: string;
    avatar: string | null;
  };
  _count: {
    enrollments: number;
    modules: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

function CoursesClient() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/categories'),
      ]);

      if (coursesRes.ok) {
        const contentType = coursesRes.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          try {
            const coursesData = await coursesRes.json();
            const publishedCourses = coursesData.filter(
              (c: Course) => c.isPublished
            );
            setCourses(publishedCourses);
          } catch (jsonError) {
            console.error('Erro ao parsear cursos:', jsonError);
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
      } else {
        setCourses([]);
      }

      if (categoriesRes.ok) {
        const contentType = categoriesRes.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          try {
            const categoriesData = await categoriesRes.json();
            setCategories(categoriesData);
          } catch (jsonError) {
            console.error('Erro ao parsear categorias:', jsonError);
            setCategories([]);
          }
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setCourses([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
      console.log('[Courses] Carregamento finalizado');
    }
  };

  // Filtrar e ordenar cursos
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || course.category.id === selectedCategory;
      const matchesLevel =
        selectedLevel === 'all' || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b._count.enrollments - a._count.enrollments;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </Link>

          <nav className="hidden sm:flex gap-4 md:gap-6 items-center">
            <Link
              href="/courses"
              className="text-sm md:text-base font-medium text-primary"
            >
              Cursos
            </Link>
            <Link
              href="/about"
              className="text-sm md:text-base hover:text-primary transition-colors"
            >
              Sobre
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Catálogo de Cursos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção de cursos e transforme sua carreira
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg border p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos os Níveis</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Ordenar:</span>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              Recentes
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Populares
            </Button>
            <Button
              variant={sortBy === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('title')}
            >
              A-Z
            </Button>
            <Button
              variant={sortBy === 'price-low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price-low')}
            >
              Menor Preço
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? (
              'Carregando...'
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {filteredCourses.length}
                </span>{' '}
                curso{filteredCourses.length !== 1 ? 's' : ''} encontrado
                {filteredCourses.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar seus filtros ou faça uma nova busca
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isPaid =
                typeof course.price === 'number' && course.price > 0;
              return (
                <Card
                  key={course.id}
                  className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="w-full h-48 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    {!isPaid && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        GRATUITO
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {course.category.name}
                      </span>
                      {course.level && (
                        <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {course.level}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription>
                      Por {course.instructor.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(course.duration / 60)}h</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course._count.enrollments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course._count.modules} módulos</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t pt-4">
                    <div>
                      {isPaid ? (
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                          Grátis
                        </span>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/courses/${course.slug}`}>Ver Curso</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SM Educacional. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get('teacherId') || undefined;

  return (
    <PublicThemeProvider teacherId={teacherId}>
      <CoursesClient />
    </PublicThemeProvider>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
