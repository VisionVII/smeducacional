// Clean rewrite to avoid parsing issues
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, Loader2, Save } from 'lucide-react';

import { BackButton } from '@/components/back-button';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    duration: '',
    level: 'Iniciante',
    price: '0',
    compareAtPrice: '',
    discount: '',
    isPaid: false,
    categoryId: '',
    requirements: '',
    whatYouLearn: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) return;
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  // Calcular desconto automaticamente
  const calculateDiscount = () => {
    const price = parseFloat(formData.price) || 0;
    const compareAtPrice = parseFloat(formData.compareAtPrice) || 0;

    if (compareAtPrice > 0 && price > 0) {
      const discount = Math.round(
        ((compareAtPrice - price) / compareAtPrice) * 100
      );
      return Math.min(discount, 100);
    }
    return 0;
  };

  // Calcular comissão do instrutor (70%)
  const calculateCommission = () => {
    const finalPrice = parseFloat(formData.price) || 0;
    return finalPrice * 0.7;
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        duration: formData.duration
          ? parseInt(formData.duration, 10)
          : undefined,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        thumbnail: formData.thumbnail || undefined,
        requirements: formData.requirements || undefined,
        whatYouLearn: formData.whatYouLearn || undefined,
      };

      const response = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        const createdCourse = result.data; // API retorna { data: course }

        toast({
          title: 'Curso criado com sucesso!',
          description: 'Redirecionando para a edição do curso...',
        });

        // ✅ FIX: Redirecionar para edição (não para página pública ainda)
        // Página pública só após publicar
        router.push(`/teacher/courses/${createdCourse.id}/edit`);
      } else {
        toast({
          title: 'Erro ao criar curso',
          description: result.error || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro ao criar curso',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8">
        <BackButton href="/teacher/courses" label="Voltar para meus cursos" />

        <Card className="relative overflow-hidden border-2 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-theme" />

          <CardHeader className="relative z-10 p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-theme rounded-2xl shadow-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl sm:text-4xl font-black text-gradient-theme-triple">
                  Criar Novo Curso
                </CardTitle>
                <CardDescription className="text-base sm:text-lg mt-2">
                  Preencha as informações básicas do curso. Você poderá
                  adicionar módulos e aulas depois.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Informações do Curso
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Título do Curso <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Introdução ao React"
                  value={formData.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  required
                  minLength={3}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-semibold">
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="introducao-ao-react"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                  required
                  minLength={3}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="font-medium">🔗 URL do curso:</span>{' '}
                  /courses/{formData.slug || 'seu-curso'}
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  className="flex min-h-[140px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="Descreva o que os alunos aprenderão neste curso..."
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  required
                  minLength={10}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="categoryId"
                    className="text-base font-semibold"
                  >
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="categoryId"
                    className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                    value={formData.categoryId}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: event.target.value,
                      }))
                    }
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-base font-semibold">
                    Nível
                  </Label>
                  <select
                    id="level"
                    className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                    value={formData.level}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        level: event.target.value,
                      }))
                    }
                  >
                    <option value="Iniciante">🌱 Iniciante</option>
                    <option value="Intermediário">📈 Intermediário</option>
                    <option value="Avançado">🚀 Avançado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base font-semibold">
                    ⏱️ Duração (minutos)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="120"
                    min="0"
                    value={formData.duration}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: event.target.value,
                      }))
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-semibold">
                    💰 Preço Final (R$)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: event.target.value,
                        isPaid: parseFloat(event.target.value) > 0,
                      }))
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Digite 0 para curso gratuito
                  </p>
                </div>
              </div>

              {/* Seção de Preço Comparativo (estilo Udemy) */}
              <div className="p-6 bg-gradient-to-br from-blue-50/40 to-purple-50/40 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  📊 Preço Comparativo (Opcional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="compareAtPrice"
                      className="text-base font-semibold"
                    >
                      Preço Original (R$)
                    </Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      placeholder="99.90"
                      min="0"
                      step="0.01"
                      value={formData.compareAtPrice}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          compareAtPrice: event.target.value,
                        }))
                      }
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco se não houver desconto
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="discount"
                      className="text-base font-semibold"
                    >
                      % Desconto (automático)
                    </Label>
                    <Input
                      id="discount"
                      type="text"
                      value={
                        calculateDiscount() > 0
                          ? `${calculateDiscount()}%`
                          : '-'
                      }
                      disabled
                      className="h-11 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Calculado automaticamente
                    </p>
                  </div>
                </div>

                {/* Resumo de preços */}
                <div className="mt-6 pt-6 border-t-2 border-blue-200/50 dark:border-blue-800/50">
                  <h4 className="font-semibold text-sm mb-3">
                    📋 Resumo de Preços
                  </h4>
                  <div className="space-y-2 text-sm">
                    {parseFloat(formData.compareAtPrice) > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Preço Original:
                          </span>
                          <span className="line-through text-muted-foreground">
                            R$ {parseFloat(formData.compareAtPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-semibold">
                          <span>Preço com Desconto:</span>
                          <span>
                            R$ {parseFloat(formData.price || '0').toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Economia:
                          </span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            R${' '}
                            {(
                              parseFloat(formData.compareAtPrice) -
                              parseFloat(formData.price || '0')
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {parseFloat(formData.compareAtPrice) === 0 ||
                    !formData.compareAtPrice ? (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Preço Final:
                        </span>
                        <span className="font-semibold">
                          R$ {parseFloat(formData.price || '0').toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex justify-between items-center bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mt-3">
                      <span className="font-semibold">Sua Comissão (70%):</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {calculateCommission().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed">
                <Label className="text-base font-semibold">
                  🖼️ Imagem de Capa do Curso
                </Label>
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, thumbnail: url }))
                  }
                  path={`courses/${formData.slug || 'new'}/thumbnail.jpg`}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground font-medium">
                  ✨ Recomendado: 1280x720px (16:9) • Máximo 5MB
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="whatYouLearn"
                  className="text-base font-semibold"
                >
                  📚 O que você aprenderá
                </Label>
                <textarea
                  id="whatYouLearn"
                  className="flex min-h-[120px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                  placeholder="- Criar aplicações React&#10;- Usar hooks avançados&#10;- Gerenciar estado com Context API"
                  value={formData.whatYouLearn}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatYouLearn: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="requirements"
                  className="text-base font-semibold"
                >
                  📋 Pré-requisitos
                </Label>
                <textarea
                  id="requirements"
                  className="flex min-h-[120px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                  placeholder="- Conhecimento básico de JavaScript&#10;- HTML e CSS intermediário&#10;- Vontade de aprender"
                  value={formData.requirements}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-theme text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Criando seu curso...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Criar Curso
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="h-12 font-semibold border-2 hover:bg-muted"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
