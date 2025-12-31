/**
 * IMAGE GALLERY COMPONENT
 * VisionVII 3.0 - Phase 2.4
 *
 * Galeria de imagens para admin com busca, filtros e gerenciamento
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Trash2,
  Eye,
  Info,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBytes, formatDate } from '@/lib/utils/format';

interface ImageMetadata {
  id: string;
  fileName: string;
  bucket: string;
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  signedUrl: string;
  uploadedBy: string;
  createdAt: string;
  usages: Array<{
    resourceType: string;
    resourceId: string;
    fieldName: string;
  }>;
}

interface ImageGalleryProps {
  className?: string;
}

export function ImageGallery({ className }: ImageGalleryProps) {
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch images (you'll need to create this endpoint)
  const {
    data: images,
    isLoading,
    error,
  } = useQuery<ImageMetadata[]>({
    queryKey: ['admin-images', bucketFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (bucketFilter !== 'all') params.set('bucket', bucketFilter);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/images?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao carregar imagens');
      const data = await response.json();
      return data.images;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar imagem');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      toast.success('Imagem removida com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover imagem');
    },
  });

  const filteredImages = images || [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={bucketFilter} onValueChange={setBucketFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os buckets</SelectItem>
            <SelectItem value="course-thumbnails">Cursos</SelectItem>
            <SelectItem value="profile-pictures">Perfis</SelectItem>
            <SelectItem value="videos">Vídeos</SelectItem>
            <SelectItem value="public-pages">Páginas Públicas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar imagens. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
        </div>
      )}

      {/* Images Grid */}
      {!isLoading && filteredImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Image Preview */}
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={image.signedUrl}
                    alt={image.fileName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Image Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p
                      className="text-sm font-medium truncate"
                      title={image.fileName}
                    >
                      {image.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(image.size)}
                      {image.width && image.height && (
                        <>
                          {' '}
                          • {image.width}×{image.height}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Bucket Badge */}
                  <Badge variant="secondary" className="text-xs">
                    {image.bucket}
                  </Badge>

                  {/* Usages */}
                  {image.usages.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>Usado em {image.usages.length} local(is)</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {/* View Details */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{image.fileName}</DialogTitle>
                          <DialogDescription>
                            Informações detalhadas da imagem
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Full Image */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={image.signedUrl}
                              alt={image.fileName}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Bucket</p>
                              <p className="text-muted-foreground">
                                {image.bucket}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Tipo</p>
                              <p className="text-muted-foreground">
                                {image.mimeType}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Tamanho</p>
                              <p className="text-muted-foreground">
                                {formatBytes(image.size)}
                              </p>
                            </div>
                            {image.width && image.height && (
                              <div>
                                <p className="font-medium">Dimensões</p>
                                <p className="text-muted-foreground">
                                  {image.width} × {image.height}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Upload</p>
                              <p className="text-muted-foreground">
                                {formatDate(image.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Usages */}
                          {image.usages.length > 0 && (
                            <div>
                              <p className="font-medium text-sm mb-2">
                                Usado em:
                              </p>
                              <div className="space-y-2">
                                {image.usages.map((usage, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm p-2 rounded bg-muted"
                                  >
                                    <Badge variant="outline">
                                      {usage.resourceType}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                      {usage.fieldName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remover imagem?</DialogTitle>
                          <DialogDescription asChild>
                            <div>
                              <p>
                                Esta ação não pode ser desfeita. A imagem será
                                marcada como deletada.
                              </p>
                              {image.usages.length > 0 && (
                                <p className="mt-2 text-red-600 font-medium">
                                  ⚠️ Esta imagem está sendo usada em{' '}
                                  {image.usages.length} local(is).
                                </p>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" onClick={() => null}>
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(image.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Removendo...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Remover
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
