'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/supabase';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  path?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  allowUrl?: boolean; // Nova opção para permitir URL
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'course-thumbnails',
  path,
  disabled = false,
  maxSizeMB = 5,
  allowUrl = true, // Permitir URL por padrão
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useUrl, setUseUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Tentar upload para Supabase
      try {
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = path || `${timestamp}.${fileExt}`;

        const { url, error: uploadError } = await uploadFile(
          file,
          bucket,
          fileName
        );

        if (uploadError) {
          throw new Error(uploadError);
        }

        onChange(url);
        setPreview(url);
      } catch (uploadErr) {
        // Se falhar, manter preview local mas avisar
        setError('Upload falhou. Configure o Supabase ou use URL.');
        console.error('Erro no upload:', uploadErr);
      }
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError('Erro ao processar a imagem');
      setPreview(value || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Digite uma URL válida');
      return;
    }
    
    setError('');
    setPreview(urlInput);
    onChange(urlInput);
    setUseUrl(false);
  };

  const handleRemove = () => {
    setPreview('');
    setUrlInput('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (useUrl && allowUrl) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="https://exemplo.com/imagem.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={disabled}
          />
          <Button 
            type="button" 
            onClick={handleUrlSubmit}
            disabled={disabled}
          >
            OK
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setUseUrl(false)}
            disabled={disabled}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        id="image-upload"
      />

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Enviando imagem...</p>
                </div>
              </div>
            )}
          </div>
          {!disabled && !isUploading && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {allowUrl && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setUseUrl(true);
                    setUrlInput(preview);
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <label
            htmlFor="image-upload"
            className={`
              flex flex-col items-center justify-center w-full h-64 
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors
              ${
                disabled
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enviando imagem...
                  </p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Clique para fazer upload</span>{' '}
                    ou arraste a imagem
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF, WEBP (máx. {maxSizeMB}MB)
                  </p>
                </>
              )}
            </div>
          </label>
          
          {allowUrl && (
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseUrl(true)}
                disabled={disabled}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Ou usar URL de imagem
              </Button>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
