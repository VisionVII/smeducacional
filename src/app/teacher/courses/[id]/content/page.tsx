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
import { VideoUploadEnhanced } from '@/components/video-upload-enhanced';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BackButton } from '@/components/back-button';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  isFree: boolean;
  videoUrl: string | null;
  content: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  modules: Module[];
}

export default function CourseContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [courseId, setCourseId] = useState<string>('');

  // Modais
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Formulários
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    isFree: false,
    videoUrl: '',
    content: '',
  });

  // Buscar curso
  useEffect(() => {
    async function initializeCourse() {
      const resolvedParams = await Promise.resolve(params);
      const id = resolvedParams.id;
      setCourseId(id);
      fetchCourse(id);
    }
    initializeCourse();
  }, [params]);

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();

        // Validar estrutura dos dados
        if (!data || !data.id) {
          throw new Error('Dados do curso inválidos');
        }

        // Garantir que modules existe e é um array
        if (!Array.isArray(data.modules)) {
          data.modules = [];
        }

        // Garantir que cada módulo tem um array de lessons
        data.modules.forEach((module: any) => {
          if (!Array.isArray(module.lessons)) {
            module.lessons = [];
          }
        });

        setCourse(data);
        setExpandedModules(new Set(data.modules.map((m: Module) => m.id)));
      } else {
        toast({
          title: 'Erro ao carregar curso',
          description: 'Curso não encontrado.',
          variant: 'destructive',
        });
        router.push('/teacher/courses');
      }
    } catch (error) {
      console.error('[CONTENT] Erro ao buscar curso:', error);
      toast({
        title: 'Erro ao carregar curso',
        description: error instanceof Error ? error.message : 'Erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // CRUD Módulos
  const openModuleModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description || '',
      });
    } else {
      setEditingModule(null);
      setModuleForm({ title: '', description: '' });
    }
    setShowModuleModal(true);
  };

  const saveModule = async () => {
    try {
      const url = editingModule
        ? `/api/modules/${editingModule.id}`
        : `/api/courses/${courseId}/modules`;
      const method = editingModule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm),
      });

      if (response.ok) {
        toast({
          title: editingModule ? 'Módulo atualizado!' : 'Módulo criado!',
          description: 'As alterações foram salvas.',
        });
        setShowModuleModal(false);
        fetchCourse(courseId);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro ao salvar módulo',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar módulo',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Deletar este módulo e todas as suas aulas?')) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Módulo deletado!' });
        fetchCourse(courseId);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro ao deletar módulo',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao deletar módulo',
        variant: 'destructive',
      });
    }
  };

  // CRUD Aulas
  const openLessonModal = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration?.toString() || '',
        isFree: lesson.isFree,
        videoUrl: lesson.videoUrl || '',
        content: lesson.content || '',
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        description: '',
        duration: '',
        isFree: false,
        videoUrl: '',
        content: '',
      });
    }
    setShowLessonModal(true);
  };

  const saveLesson = async () => {
    try {
      const url = editingLesson
        ? `/api/lessons/${editingLesson.id}`
        : `/api/modules/${selectedModuleId}/lessons`;
      const method = editingLesson ? 'PUT' : 'POST';

      const payload = {
        ...lessonForm,
        duration: lessonForm.duration
          ? parseInt(lessonForm.duration)
          : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingLesson ? 'Aula atualizada!' : 'Aula criada!',
          description: 'As alterações foram salvas.',
        });
        setShowLessonModal(false);
        fetchCourse(courseId);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro ao salvar aula',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar aula',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Deletar esta aula?')) return;

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Aula deletada!' });
        fetchCourse(courseId);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro ao deletar aula',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao deletar aula',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <BackButton href="/teacher/courses" label="Voltar para meus cursos" />
          <h1 className="text-3xl font-bold mt-4">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerenciar conteúdo do curso
          </p>
        </div>
        <Button onClick={() => openModuleModal()} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {/* Lista de Módulos */}
      {!course.modules || course.modules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum módulo criado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comece organizando seu curso em módulos e aulas
            </p>
            <Button onClick={() => openModuleModal()}>
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {course.modules?.map((module, index) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Módulo {index + 1}: {module.title}
                      </CardTitle>
                      {module.description && (
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModuleModal(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openLessonModal(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Aula
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedModules.has(module.id) && (
                <CardContent>
                  {!module.lessons || module.lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">Nenhuma aula neste módulo</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLessonModal(module.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeira Aula
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          {lesson.videoUrl ? (
                            <PlayCircle className="h-4 w-4 text-blue-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-600" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">
                              {lessonIndex + 1}. {lesson.title}
                            </div>
                            {lesson.duration && (
                              <div className="text-xs text-gray-500">
                                {Math.floor(lesson.duration / 60)}:
                                {String(lesson.duration % 60).padStart(2, '0')}
                              </div>
                            )}
                          </div>
                          {lesson.isFree && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              Gratuita
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openLessonModal(module.id, lesson)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Módulo */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Título *</Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ex: Introdução ao React"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Descrição</Label>
                <textarea
                  id="module-description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descreva o conteúdo deste módulo..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowModuleModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveModule} disabled={!moduleForm.title}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Aula */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="w-full max-w-2xl bg-background rounded-xl shadow-xl overflow-y-auto max-h-[90vh] my-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-title">Título *</Label>
                  <Input
                    id="lesson-title"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Ex: Componentes e Props"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-description">Descrição</Label>
                  <textarea
                    id="lesson-description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descreva o conteúdo da aula..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-duration">Duração (segundos)</Label>
                    <Input
                      id="lesson-duration"
                      type="number"
                      min="0"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lesson-free">Acesso</Label>
                    <select
                      id="lesson-free"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={lessonForm.isFree.toString()}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          isFree: e.target.value === 'true',
                        }))
                      }
                    >
                      <option value="false">Apenas matriculados</option>
                      <option value="true">Gratuita (preview)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-video">Vídeo da Aula</Label>
                  <VideoUploadEnhanced
                    value={lessonForm.videoUrl}
                    onChange={(url) =>
                      setLessonForm((prev) => ({ ...prev, videoUrl: url }))
                    }
                    lessonId={editingLesson?.id}
                    maxSizeMB={500}
                  />
                  <p className="text-xs text-gray-500">
                    Faça upload de um vídeo (até 500MB) ou cole um link do
                    YouTube/Vimeo
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-content">Conteúdo em Texto</Label>
                  <textarea
                    id="lesson-content"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Conteúdo adicional da aula em texto, código, etc..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowLessonModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={saveLesson} disabled={!lessonForm.title}>
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
