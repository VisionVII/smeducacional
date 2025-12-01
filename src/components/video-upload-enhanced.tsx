'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Upload,
  X,
  FileVideo,
  Loader2,
  Link as LinkIcon,
  PlayCircle,
  Video,
} from 'lucide-react';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  lessonId?: string;
  maxSizeMB?: number;
}

export function VideoUploadEnhanced({
  value,
  onChange,
  lessonId,
  maxSizeMB = 500,
}: VideoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo de vídeo.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'Arquivo muito grande',
        description: `O vídeo deve ter no máximo ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${lessonId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      
      toast({
        title: 'Upload concluído!',
        description: 'Vídeo enviado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível enviar o vídeo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL válida.',
        variant: 'destructive',
      });
      return;
    }

    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrlInput(false);
    
    toast({
      title: 'URL adicionada!',
      description: 'Link do vídeo salvo com sucesso.',
    });
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
  };

  const isExternalVideo = value && (
    value.includes('youtube.com') || 
    value.includes('youtu.be') || 
    value.includes('vimeo.com')
  );

  return (
    <div className="space-y-4">
      {value ? (
        // Preview do vídeo
        <div className="relative rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0">
              {isExternalVideo ? (
                <Video className="h-10 w-10 text-red-600" />
              ) : (
                <PlayCircle className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">Vídeo carregado</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {isExternalVideo ? 'Vídeo externo' : 'Vídeo hospedado'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Preview */}
          {!isExternalVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={value}
                controls
                className="w-full h-full"
                preload="metadata"
              />
            </div>
          )}
        </div>
      ) : (
        // Upload UI
        <div className="space-y-3">
          {showUrlInput ? (
            // URL Input
            <div className="space-y-2">
              <Label>URL do Vídeo (YouTube, Vimeo, etc.)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
                <Button onClick={handleUrlSubmit}>Adicionar</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlInput('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            // Upload Button
            <>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                    <p className="font-medium">Enviando vídeo...</p>
                    <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                    <p className="text-sm text-gray-600">
                      Aguarde enquanto fazemos o upload...
                    </p>
                  </div>
                ) : (
                  <>
                    <FileVideo className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium mb-2">
                      Clique para fazer upload
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      MP4, MOV, AVI (máx. {maxSizeMB}MB)
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t" />
                <span className="text-sm text-gray-500">ou</span>
                <div className="flex-1 border-t" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUrlInput(true)}
                disabled={isUploading}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Adicionar link de vídeo (YouTube, Vimeo)
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
