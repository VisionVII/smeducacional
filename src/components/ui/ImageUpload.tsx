'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  value?: string; // URL da imagem
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  bucket?: string; // padrão: 'public-pages'
  maxSize?: number; // em MB, padrão: 5
  accept?: string; // MIME types
}

export function ImageUpload({
  value,
  onChange,
  label = 'Imagem',
  placeholder = 'Clique para fazer upload',
  bucket = 'public-pages',
  maxSize = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const [manualUrl, setManualUrl] = useState(value || '');

  useEffect(() => {
    setManualUrl(value || '');
  }, [value]);

  const handleFileSelect = async (file: File) => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: `Arquivo muito grande (máximo ${maxSize}MB)`,
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo deve ser uma imagem',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Criar FormData para enviar arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        const details = typeof error.error === 'string' ? error.error : '';
        throw new Error(details || 'Erro no upload (verifique /api/upload)');
      }

      const { url } = await res.json();
      onChange(url);
      toast({ title: 'Imagem enviada com sucesso' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro no upload',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleManualSave = () => {
    const url = manualUrl.trim();
    onChange(url);
    if (url) {
      toast({ title: 'URL aplicada ao preview' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium" htmlFor={inputId}>
          {label}
        </label>
      )}

      {/* Preview */}
      {value && (
        <div className="relative h-40 rounded-lg border overflow-hidden bg-muted">
          <img
            id={inputId}
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={isLoading}
            className="absolute top-2 right-2 p-1 bg-destructive rounded-full text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
            aria-label="Remover imagem"
            aria-describedby={helperId}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="space-y-2">
          {isLoading ? (
            <>
              <Loader className="h-8 w-8 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  Arraste arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Input
          id={inputId}
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onBlur={handleManualSave}
          placeholder="Ou cole a URL pública (ex: Supabase Storage)"
          aria-describedby={helperId}
        />
        <p id={helperId} className="text-xs text-muted-foreground">
          Dica: se o upload falhar, cole aqui a URL pública do arquivo já
          hospedado. Tamanho máximo {maxSize}MB.
        </p>
      </div>
    </div>
  );
}
