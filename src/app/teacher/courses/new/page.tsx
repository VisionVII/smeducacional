'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/image-upload';

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
    isPaid: false,
    categoryId: '',
    requirements: '',
    whatYouLearn: '',
  });

  // Buscar categorias
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    }
    fetchCategories();
  }, []);

  // Gerar slug automaticamente
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
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
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        price: parseFloat(formData.price),
        thumbnail: formData.thumbnail || undefined,
        requirements: formData.requirements || undefined,
        whatYouLearn: formData.whatYouLearn || undefined,
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Curso criado com sucesso!',
          description: 'Agora você pode adicionar módulos e aulas.',
        });
        router.push(`/teacher/courses/${data.id}/content`);
      } else {
        toast({
          title: 'Erro ao criar curso',
          description: data.error || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    } catch (error) {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/teacher/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para meus cursos
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Curso</CardTitle>
          <CardDescription>
            Preencha as informações básicas do curso. Você poderá adicionar módulos e aulas depois.
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
                placeholder="Ex: Introdução ao React"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
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
                placeholder="introducao-ao-react"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                minLength={3}
              />
              <p className="text-xs text-gray-500">
                URL do curso: /courses/{formData.slug || 'seu-curso'}
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva o que os alunos aprenderão neste curso..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                minLength={10}
              />
            </div>

            {/* Categoria e Nível */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  Categoria <span className="text-red-500">*</span>
                </Label>
                <select
                  id="categoryId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
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
                  placeholder="120"
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
                  placeholder="0.00"
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
                path={`courses/${formData.slug || 'new'}/thumbnail.jpg`}
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
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="- Criar aplicações React&#10;- Usar hooks&#10;- Gerenciar estado"
                value={formData.whatYouLearn}
                onChange={(e) => setFormData(prev => ({ ...prev, whatYouLearn: e.target.value }))}
              />
            </div>

            {/* Pré-requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Pré-requisitos</Label>
              <textarea
                id="requirements"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="- Conhecimento básico de JavaScript&#10;- HTML e CSS"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Curso
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
