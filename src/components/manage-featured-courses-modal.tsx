'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Star, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  isFeatured?: boolean;
  category?: {
    name: string;
  };
}

interface ManageFeaturedCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export function ManageFeaturedCoursesModal({
  isOpen,
  onClose,
  courses,
}: ManageFeaturedCoursesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(courses.filter((c) => c.isFeatured).map((c) => c.id))
  );

  const updateFeaturedMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const newState = !selectedCourses.has(courseId);
      const res = await fetch(`/api/admin/courses/${courseId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newState }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar curso');
      }

      return { courseId, newState };
    },
    onSuccess: (data) => {
      // Atualizar estado local
      const newSelected = new Set(selectedCourses);
      if (data.newState) {
        newSelected.add(data.courseId);
      } else {
        newSelected.delete(data.courseId);
      }
      setSelectedCourses(newSelected);

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'featured'] });

      toast({
        title: 'Sucesso',
        description: data.newState
          ? 'Curso adicionado aos promovidos'
          : 'Curso removido dos promovidos',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Erro ao atualizar curso',
        variant: 'destructive',
      });
    },
  });

  const toggleCourse = (courseId: string) => {
    updateFeaturedMutation.mutate(courseId);
  };

  const selectedCount = selectedCourses.size;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Gerenciar Cursos Promovidos
          </DialogTitle>
          <DialogDescription>
            Selecione os cursos que deseja mostrar na primeira camada (carousel)
            da página de catálogo. Máximo de 5 cursos recomendado.
          </DialogDescription>
        </DialogHeader>

        {selectedCount > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedCount} curso{selectedCount !== 1 ? 's' : ''} selecionado
              {selectedCount !== 1 ? 's' : ''}
              {selectedCount > 5 && (
                <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                  (mais de 5 não é recomendado)
                </span>
              )}
            </p>
          </div>
        )}

        <div className="space-y-3 mt-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum curso disponível para promoção.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Publique cursos primeiro para poder promovê-los.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <label
                key={course.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={selectedCourses.has(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                  disabled={updateFeaturedMutation.isPending}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {course.title}
                      </p>
                      {course.category && (
                        <Badge variant="secondary" className="mt-1">
                          {course.category.name}
                        </Badge>
                      )}
                    </div>
                    {selectedCourses.has(course.id) && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                {updateFeaturedMutation.isPending &&
                  updateFeaturedMutation.variables === course.id && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                  )}
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
