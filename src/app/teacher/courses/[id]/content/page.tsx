'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { RichTextEditor } from '@/components/rich-text-editor';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        data.modules.forEach((module: { lessons?: unknown[] }) => {
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
    } catch (err) {
      console.error('Erro ao salvar módulo:', err);
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
      console.error('Erro ao deletar módulo:', error);
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
    } catch (err) {
      console.error('Erro ao salvar aula:', err);
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
    } catch (err) {
      console.error('Erro ao deletar módulo:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Premium Header Card */}
        <Card className="border-0 shadow-2xl bg-gradient-theme-triple text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10" />
          <CardContent className="relative p-5 sm:p-6 lg:p-8">
            <div className="mb-4 sm:mb-6">
              <BackButton
                href="/teacher/courses"
                label="Voltar para meus cursos"
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {course.title}
                </h1>
                <p className="text-base sm:text-lg text-white/90 max-w-2xl">
                  Organize e gerencie o conteúdo do seu curso em módulos e aulas
                </p>
              </div>
              <Button
                onClick={() => openModuleModal()}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg w-full lg:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Módulo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Módulos */}
        {!course.modules || course.modules.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-12 sm:py-16 lg:py-20 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-primary/10 p-6">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Nenhum módulo criado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg max-w-md mx-auto">
                Comece organizando seu curso em módulos e aulas para oferecer
                uma experiência estruturada aos alunos
              </p>
              <Button
                onClick={() => openModuleModal()}
                size="lg"
                className="shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeiro Módulo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {course.modules?.map((module, index) => (
              <Card
                key={module.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors shrink-0"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div className="shrink-0 hidden sm:block">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg lg:text-xl truncate">
                          Módulo {index + 1}: {module.title}
                        </CardTitle>
                        {module.description && (
                          <CardDescription className="mt-1 sm:mt-2 line-clamp-2">
                            {module.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModuleModal(module)}
                        className="hover:bg-primary hover:text-white transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteModule(module.id)}
                        className="hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Excluir</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openLessonModal(module.id)}
                        className="shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Nova </span>Aula
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedModules.has(module.id) && (
                  <CardContent className="pt-2">
                    {!module.lessons || module.lessons.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500 bg-muted/30 rounded-lg">
                        <p className="mb-4 text-sm sm:text-base">
                          Nenhuma aula neste módulo
                        </p>
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
                      <div className="space-y-2 sm:space-y-3">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="shrink-0 hidden sm:block">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                              {lesson.videoUrl ? (
                                <div className="shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                                  <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                </div>
                              ) : (
                                <div className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 p-2">
                                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">
                                  {lessonIndex + 1}. {lesson.title}
                                </div>
                                {lesson.duration && (
                                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Duração: {Math.floor(lesson.duration / 60)}:
                                    {String(lesson.duration % 60).padStart(
                                      2,
                                      '0'
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end sm:justify-start">
                              {lesson.isFree && (
                                <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium">
                                  Gratuita
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openLessonModal(module.id, lesson)
                                }
                                className="hover:bg-primary hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(lesson.id)}
                                className="hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl border-0 shadow-2xl animate-in fade-in zoom-in duration-300">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl sm:text-2xl">
                  {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                </CardTitle>
                <CardDescription>
                  {editingModule
                    ? 'Atualize as informações do módulo'
                    : 'Crie um novo módulo para organizar suas aulas'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="module-title" className="text-sm font-medium">
                    Título <span className="text-red-500">*</span>
                  </Label>
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
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="module-description"
                    className="text-sm font-medium"
                  >
                    Descrição
                  </Label>
                  <textarea
                    id="module-description"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowModuleModal(false)}
                    className="min-w-[100px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={saveModule}
                    disabled={!moduleForm.title}
                    className="min-w-[100px] shadow-md"
                  >
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Aula */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] my-4 sm:my-8 animate-in fade-in zoom-in duration-300">
              <Card className="border-0">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl sm:text-2xl">
                    {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                  </CardTitle>
                  <CardDescription>
                    {editingLesson
                      ? 'Atualize as informações da aula'
                      : 'Adicione uma nova aula ao módulo'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="lesson-title"
                      className="text-sm font-medium"
                    >
                      Título <span className="text-red-500">*</span>
                    </Label>
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
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lesson-description"
                      className="text-sm font-medium"
                    >
                      Descrição
                    </Label>
                    <textarea
                      id="lesson-description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="lesson-duration"
                        className="text-sm font-medium"
                      >
                        Duração (segundos)
                      </Label>
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
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lesson-free"
                        className="text-sm font-medium"
                      >
                        Acesso
                      </Label>
                      <select
                        id="lesson-free"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <Label
                      htmlFor="lesson-video"
                      className="text-sm font-medium"
                    >
                      Vídeo da Aula
                    </Label>
                    <VideoUploadEnhanced
                      value={lessonForm.videoUrl}
                      onChange={(url) =>
                        setLessonForm((prev) => ({ ...prev, videoUrl: url }))
                      }
                      lessonId={editingLesson?.id}
                      maxSizeMB={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      Faça upload de um vídeo (até 500MB) ou cole um link do
                      YouTube/Vimeo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lesson-content"
                      className="text-sm font-medium"
                    >
                      Conteúdo em Texto
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Use a barra de ferramentas para formatar o conteúdo:
                      títulos, listas, código, imagens, etc.
                    </p>
                    <RichTextEditor
                      content={lessonForm.content}
                      onChange={(html) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          content: html,
                        }))
                      }
                      placeholder="Escreva o conteúdo da aula... Use **negrito** _itálico_ `código`"
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowLessonModal(false)}
                      className="min-w-[100px]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={saveLesson}
                      disabled={!lessonForm.title}
                      className="min-w-[100px] shadow-md"
                    >
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
