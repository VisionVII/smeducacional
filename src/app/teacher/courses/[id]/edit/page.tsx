'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/image-upload';

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
  isPaid: boolean;
  isPublished: boolean;
  categoryId: string;
  requirements: string | null;
  whatYouLearn: string | null;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
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
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        price: parseFloat(formData.price),
        thumbnail: formData.thumbnail || undefined,
        requirements: formData.requirements || undefined,
        whatYouLearn: formData.whatYouLearn || undefined,
      };

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
        toast({
          title: 'Erro ao atualizar curso',
          description: data.error || 'Tente novamente mais tarde.',
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
    if (!confirm('Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita.')) {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/teacher/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para meus cursos
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Deletar Curso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Curso</CardTitle>
          <CardDescription>
            Atualize as informações do curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título do Curso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                minLength={3}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (URL) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                minLength={3}
              />
              <p className="text-xs text-gray-500">
                URL do curso: /courses/{formData.slug}
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                minLength={10}
              />
            </div>

            {/* Categoria, Nível e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isPublished">Status</Label>
                <select
                  id="isPublished"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.isPublished.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.value === 'true' }))}
                >
                  <option value="false">Rascunho</option>
                  <option value="true">Publicado</option>
                </select>
              </div>
            </div>

            {/* Duração e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: e.target.value,
                    isPaid: parseFloat(e.target.value) > 0
                  }))}
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Imagem de Capa do Curso</Label>
              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                path={`courses/${course?.slug || courseId}/thumbnail.jpg`}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Recomendado: 1280x720px (16:9) • Máximo 5MB
              </p>
            </div>

            {/* O que você aprenderá */}
            <div className="space-y-2">
              <Label htmlFor="whatYouLearn">O que você aprenderá</Label>
              <textarea
                id="whatYouLearn"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.whatYouLearn}
                onChange={(e) => setFormData(prev => ({ ...prev, whatYouLearn: e.target.value }))}
              />
            </div>

            {/* Pré-requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Pré-requisitos</Label>
              <textarea
                id="requirements"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
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
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
