'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  X,
  FileText,
  File,
  Loader2,
  Download,
  FilePdf,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

interface Material {
  id?: string;
  title: string;
  url: string;
  fileType: string;
  fileSize?: number;
}

interface MaterialUploadProps {
  lessonId: string;
  materials?: Material[];
  onMaterialsChange: (materials: Material[]) => void;
  maxSizeMB?: number;
}

export function MaterialUpload({
  lessonId,
  materials = [],
  onMaterialsChange,
  maxSizeMB = 50,
}: MaterialUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      // Validar tamanho
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de ${maxSizeMB}MB.`,
          variant: 'destructive',
        });
        continue;
      }

      await uploadFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${lessonId}-${Date.now()}-${file.name}`;
      const filePath = `materials/${fileName}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      // Adicionar à lista de materiais
      const newMaterial: Material = {
        title: file.name,
        url: publicUrl,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
      };

      onMaterialsChange([...materials, newMaterial]);
      
      toast({
        title: 'Upload concluído!',
        description: `${file.name} enviado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || `Não foi possível enviar ${file.name}.`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    onMaterialsChange(newMaterials);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FilePdf className="h-5 w-5 text-red-600" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) 
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (fileType.includes('code') || fileType.includes('text/plain'))
      return <FileCode className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600" />
            <p className="font-medium">Enviando arquivo...</p>
            <Progress value={uploadProgress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="font-medium mb-1">
              Clique para adicionar materiais
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PDF, DOC, XLS, PPT, ZIP (máx. {maxSizeMB}MB cada)
            </p>
          </>
        )}
      </div>

      {/* Lista de Materiais */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <Label>Materiais Anexados ({materials.length})</Label>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {getFileIcon(material.fileType)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {material.title}
                  </div>
                  {material.fileSize && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(material.fileSize)}
                    </div>
                  )}
                </div>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
