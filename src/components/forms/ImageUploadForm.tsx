/**
 * IMAGE UPLOAD FORM COMPONENT
 * VisionVII 3.0 - Phase 2.4
 *
 * Componente reutilizável para upload de imagens com drag-and-drop
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadFormProps {
  bucket: 'course-thumbnails' | 'profile-pictures' | 'videos' | 'public-pages';
  resourceType:
    | 'COURSE'
    | 'USER'
    | 'PAGE'
    | 'LESSON'
    | 'AD'
    | 'CERTIFICATE'
    | 'CONFIG';
  resourceId: string;
  fieldName: string;
  currentImageUrl?: string;
  onUploadSuccess?: (imageId: string, signedUrl: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUploadForm({
  bucket,
  resourceType,
  resourceId,
  fieldName,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
}: ImageUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        // Validação de tamanho
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
        }

        // Preview local
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('resourceType', resourceType);
        formData.append('resourceId', resourceId);
        formData.append('fieldName', fieldName);

        // Simular progresso
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload
        const response = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao fazer upload');
        }

        const data = await response.json();

        // Callback de sucesso
        if (onUploadSuccess) {
          onUploadSuccess(data.image.id, data.image.signedUrl);
        }

        setPreview(data.image.signedUrl);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setPreview(currentImageUrl || null);

        if (onUploadError) {
          onUploadError(errorMessage);
        }
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [
      bucket,
      resourceType,
      resourceId,
      fieldName,
      maxSize,
      currentImageUrl,
      onUploadSuccess,
      onUploadError,
    ]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
      maxFiles: 1,
      maxSize: maxSize * 1024 * 1024,
      disabled: uploading,
    });

  const removeImage = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          {!uploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Dropzone */}
      {!preview && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            !isDragActive &&
              'border-muted-foreground/25 hover:border-primary/50',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Upload className="h-10 w-10 text-muted-foreground animate-pulse" />
                <p className="text-sm font-medium">Fazendo upload...</p>
                <Progress value={progress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Solte a imagem aqui'
                    : 'Arraste uma imagem ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxSize}MB •{' '}
                  {acceptedTypes
                    .map((t) => t.split('/')[1].toUpperCase())
                    .join(', ')}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileRejections[0].errors[0].message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
