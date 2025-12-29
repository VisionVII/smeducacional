'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /**
   * Tipo de arquivo aceito (logo, favicon, image, document)
   */
  type: 'logo' | 'favicon' | 'image' | 'document';

  /**
   * URL atual do arquivo (se existir)
   */
  currentUrl?: string | null;

  /**
   * Callback quando arquivo é selecionado/uploaded
   */
  onUpload: (file: File) => Promise<void>;

  /**
   * Callback para remover arquivo
   */
  onRemove?: () => void;

  /**
   * Label do input
   */
  label?: string;

  /**
   * Descrição adicional
   */
  description?: string;

  /**
   * Tamanho máximo em MB
   */
  maxSizeMB?: number;

  /**
   * Classe adicional
   */
  className?: string;

  /**
   * Estado de carregamento externo
   */
  isUploading?: boolean;
}

const FILE_TYPE_CONFIG = {
  logo: {
    accept: 'image/png,image/jpeg,image/svg+xml,image/webp',
    maxSize: 5,
    label: 'Logo',
    icon: ImageIcon,
    preview: true,
  },
  favicon: {
    accept: 'image/x-icon,image/png,image/svg+xml',
    maxSize: 1,
    label: 'Favicon',
    icon: ImageIcon,
    preview: true,
  },
  image: {
    accept: 'image/png,image/jpeg,image/webp',
    maxSize: 10,
    label: 'Imagem',
    icon: ImageIcon,
    preview: true,
  },
  document: {
    accept: 'application/pdf,.doc,.docx',
    maxSize: 20,
    label: 'Documento',
    icon: Upload,
    preview: false,
  },
};

export function FileUpload({
  type,
  currentUrl,
  onUpload,
  onRemove,
  label,
  description,
  maxSizeMB,
  className,
  isUploading: externalLoading,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_TYPE_CONFIG[type];
  const maxSize = maxSizeMB || config.maxSize;
  const Icon = config.icon;
  const loading = externalLoading || isUploading;
  const previewDims =
    type === 'logo'
      ? { width: 256, height: 64 }
      : type === 'favicon'
      ? { width: 32, height: 32 }
      : { width: 256, height: 128 };

  const validateFile = (file: File): string | null => {
    // Validar tipo
    const acceptedTypes = config.accept.split(',');
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    const isValidType = acceptedTypes.some(
      (type) => fileType === type || fileExtension === type
    );

    if (!isValidType) {
      return `Tipo de arquivo inválido. Aceitos: ${config.accept}`;
    }

    // Validar tamanho
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validar arquivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Upload
    try {
      setIsUploading(true);
      await onUpload(file);
      setError(null);
    } catch (err) {
      console.error('[FileUpload] Erro ao fazer upload:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleRemove = () => {
    setError(null);
    onRemove?.();
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label e Descrição */}
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label={label || config.label}
      />

      {/* Área de Preview / Upload */}
      {currentUrl && !loading ? (
        <div className="relative rounded-lg border bg-muted/50 p-4">
          {/* Preview da imagem */}
          {config.preview && (
            <div className="flex items-center justify-center mb-3">
              <Image
                src={currentUrl as string}
                alt="Preview"
                {...previewDims}
                unoptimized
                className={cn(
                  'object-contain',
                  type === 'logo' && 'h-16',
                  type === 'favicon' && 'h-8 w-8',
                  type === 'image' && 'h-32'
                )}
              />
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClickUpload}
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Trocar arquivo
            </Button>

            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Área de Drag & Drop */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            'hover:border-primary/50 hover:bg-accent/50',
            isDragging && 'border-primary bg-accent',
            loading && 'opacity-50 cursor-not-allowed',
            'p-8 text-center'
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            {loading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Fazendo upload...
                </p>
              </>
            ) : (
              <>
                <Icon className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Clique ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.accept.split(',').join(', ')} • Máx. {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
