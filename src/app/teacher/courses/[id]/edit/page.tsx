'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/image-upload';
import { BackButton } from '@/components/back-button';

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  duration: number | null;
  level: string | null;
  price: number;
  compareAtPrice: number | null;
  isPaid: boolean;
  isPublished: boolean;
  categoryId: string;
  requirements: string | null;
  whatYouLearn: string | null;
}

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    duration: '',
    level: 'Iniciante',
    price: '0',
    compareAtPrice: '',
    isPaid: false,
    isPublished: false,
    categoryId: '',
    requirements: '',
    whatYouLearn: '',
  });

  // Buscar curso e categorias
  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.id;
        setCourseId(id);

        const [courseRes, categoriesRes] = await Promise.all([
          fetch(`/api/courses/${id}`),
          fetch('/api/categories'),
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);
          setFormData({
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            thumbnail: courseData.thumbnail || '',
            duration: courseData.duration?.toString() || '',
            level: courseData.level || 'Iniciante',
            price: courseData.price.toString(),
            compareAtPrice: courseData.compareAtPrice?.toString() || '',
            isPaid: courseData.isPaid,
            isPublished: courseData.isPublished,
            categoryId: courseData.categoryId,
            requirements: courseData.requirements || '',
            whatYouLearn: courseData.whatYouLearn || '',
          });
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: 'Erro ao carregar curso',
          description: 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    }
    fetchData();
  }, [params, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitizar dados antes de enviar
      const duration = formData.duration?.trim();
      const price = formData.price?.trim();
      const compareAtPrice = formData.compareAtPrice?.trim();

      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        level: formData.level,
        isPublished: formData.isPublished,
        categoryId: formData.categoryId,
      };

      // Adicionar campos opcionais apenas se tiverem valor válido
      if (duration && !isNaN(parseInt(duration))) {
        payload.duration = parseInt(duration);
      }

      // Price é obrigatório - sempre enviar
      if (
        price !== undefined &&
        price !== null &&
        price !== '' &&
        !isNaN(parseFloat(price))
      ) {
        payload.price = parseFloat(price);
      } else {
        // Fallback para 0 se vazio (curso gratuito)
        payload.price = 0;
      }
      if (compareAtPrice && !isNaN(parseFloat(compareAtPrice))) {
        payload.compareAtPrice = parseFloat(compareAtPrice);
      } else {
        payload.compareAtPrice = null; // Explicitamente null se vazio
      }

      if (formData.thumbnail?.trim()) {
        payload.thumbnail = formData.thumbnail.trim();
      }

      if (formData.requirements?.trim()) {
        payload.requirements = formData.requirements.trim();
      }

      if (formData.whatYouLearn?.trim()) {
        payload.whatYouLearn = formData.whatYouLearn.trim();
      }

      console.log('[EDIT] Payload enviado:', payload);

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Curso atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
        router.push('/teacher/courses');
      } else {
        const errorText = await response.text();
        let errorMessage = 'Tente novamente mais tarde.';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          console.error('[EDIT] Erro do servidor:', errorData);
        } catch {
          console.error('[EDIT] Resposta de erro:', errorText);
        }

        toast({
          title: 'Erro ao atualizar curso',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao atualizar curso',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Curso deletado',
          description: 'O curso foi removido com sucesso.',
        });
        router.push('/teacher/courses');
      } else {
        toast({
          title: 'Erro ao deletar curso',
          description: data.error || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao deletar curso',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Premium Header */}
        <Card className="border-0 shadow-2xl bg-gradient-theme-triple text-white overflow-hidden relative group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <CardContent className="relative p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <BackButton
                  href="/teacher/courses"
                  label="Voltar para meus cursos"
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Editar Curso
                </h1>
                <p className="text-base sm:text-lg text-white/90">
                  Atualize as informações e configurações do curso
                </p>
              </div>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 shadow-lg w-full sm:w-auto"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-2" />
                )}
                Deletar Curso
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Formulário Principal */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl sm:text-2xl">
              Informações do Curso
            </CardTitle>
            <CardDescription className="text-base">
              Preencha os campos abaixo para atualizar seu curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título do Curso <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  minLength={3}
                  className="h-11"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  minLength={3}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  URL do curso: /courses/{formData.slug}
                </p>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  minLength={10}
                />
              </div>

              {/* Categoria, Nível e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium">
                    Categoria
                  </Label>
                  <select
                    id="categoryId"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Nível
                  </Label>
                  <select
                    id="level"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }))
                    }
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isPublished" className="text-sm font-medium">
                    Status
                  </Label>
                  <select
                    id="isPublished"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.isPublished.toString()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublished: e.target.value === 'true',
                      }))
                    }
                  >
                    <option value="false">Rascunho</option>
                    <option value="true">Publicado</option>
                  </select>
                </div>
              </div>

              {/* Duração e Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duração (minutos)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="compareAtPrice"
                    className="text-sm font-medium"
                  >
                    Preço Original (R$)
                    <span className="text-xs text-muted-foreground ml-1">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 299.90"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value,
                      }))
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece como "De R$ X"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Preço Atual (R$) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 197.90 ou 0 para curso gratuito"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                        isPaid: parseFloat(e.target.value) > 0,
                      }))
                    }
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Use <strong>0</strong> para curso gratuito
                  </p>
                  {(() => {
                    const comparePrice = parseFloat(
                      formData.compareAtPrice || '0'
                    );
                    const currentPrice = parseFloat(formData.price || '0');

                    if (
                      !isNaN(comparePrice) &&
                      !isNaN(currentPrice) &&
                      comparePrice > 0 &&
                      currentPrice > 0 &&
                      comparePrice > currentPrice
                    ) {
                      const discount =
                        ((comparePrice - currentPrice) / comparePrice) * 100;
                      return (
                        <p className="text-xs text-green-600 font-medium">
                          💰 Desconto: {discount.toFixed(0)}% OFF
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Imagem de Capa do Curso
                </Label>
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, thumbnail: url }))
                  }
                  path={`courses/${course?.slug || courseId}/thumbnail.jpg`}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1280x720px (16:9) • Máximo 5MB
                </p>
              </div>

              {/* O que você aprenderá */}
              <div className="space-y-2">
                <Label htmlFor="whatYouLearn" className="text-sm font-medium">
                  O que você aprenderá
                </Label>
                <textarea
                  id="whatYouLearn"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.whatYouLearn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatYouLearn: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Pré-requisitos */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium">
                  Pré-requisitos
                </Label>
                <textarea
                  id="requirements"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="h-11"
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
