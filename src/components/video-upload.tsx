'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadFile } from '@/lib/supabase';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  lessonId?: string;
  disabled?: boolean;
  maxSizeMB?: number;
}

export function VideoUpload({
  value,
  onChange,
  lessonId,
  disabled = false,
  maxSizeMB = 500,
}: VideoUploadProps) {
  const [videoUrl, setVideoUrl] = useState<string>(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido');
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(
        `O vídeo deve ter no máximo ${maxSizeMB}MB. Tamanho atual: ${fileSizeMB.toFixed(
          2
        )}MB`
      );
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso (Supabase não tem callback de progresso nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = lessonId
        ? `lessons/${lessonId}/${timestamp}.${fileExt}`
        : `temp/${timestamp}.${fileExt}`;

      const { url, error: uploadError } = await uploadFile(
        file,
        'lesson-videos',
        fileName
      );

      clearInterval(progressInterval);

      if (uploadError) {
        throw new Error(uploadError);
      }

      setUploadProgress(100);
      setVideoUrl(url);
      onChange(url);

      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao fazer upload do vídeo.'
      );
      setVideoUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    // Pausar vídeo antes de remover para evitar AbortError
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }

    setVideoUrl('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        id="video-upload"
      />

      {videoUrl ? (
        <div className="space-y-3">
          {/* Preview do vídeo */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
              preload="metadata"
              onLoadStart={() => {
                // Evitar autoplay que pode causar AbortError
                if (videoRef.current) {
                  videoRef.current.pause();
                }
              }}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>

          {/* Controles */}
          {!disabled && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Trocar Vídeo
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <label
            htmlFor="video-upload"
            className={`
              flex flex-col items-center justify-center w-full aspect-video
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors
              ${
                disabled
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center py-8">
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Fazendo upload do vídeo...
                  </p>
                  <div className="w-64">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {uploadProgress}%
                  </p>
                </>
              ) : (
                <>
                  <Video className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">
                      Clique para fazer upload
                    </span>{' '}
                    ou arraste o vídeo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MP4, WebM, MOV (máx. {maxSizeMB}MB)
                  </p>
                </>
              )}
            </div>
          </label>
        </>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!videoUrl && !error && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 <strong>Dica:</strong> Apenas vídeos enviados por upload são
            aceitos.
          </p>
        </div>
      )}
    </div>
  );
}
