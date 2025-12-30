'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BrandingAssets {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  loginBgUrl?: string | null;
  promotedCourseId?: string | null;
}

interface BrandingTabProps {
  assets: BrandingAssets;
  onUpdate: (field: keyof BrandingAssets, value: string | null) => void;
}

interface Course {
  id: string;
  title: string;
}

export function BrandingTab({ assets, onUpdate }: BrandingTabProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/admin/courses?status=PUBLISHED');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      }
    }
    fetchCourses();
  }, []);

  const handleUpload = async (
    file: File,
    type: 'logo' | 'favicon' | 'loginBg',
    field: keyof BrandingAssets
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/admin/upload-branding', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin', // Garante envio de cookies de sessão
      });

      // Verificar se a resposta é JSON
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Resposta não-JSON recebida:', {
          status: res.status,
          statusText: res.statusText,
          contentType,
          url: res.url,
        });

        // Se recebeu HTML, provavelmente foi redirecionado
        if (contentType?.includes('text/html')) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        throw new Error('Erro de comunicação com servidor.');
      }

      const jsonData = await res.json();

      if (!res.ok) {
        throw new Error(jsonData.error || 'Erro ao fazer upload');
      }

      onUpdate(field, jsonData.data.url);

      toast({
        title: 'Upload realizado',
        description: 'Arquivo enviado com sucesso.',
      });
    } catch (error) {
      console.error('[BrandingTab] Erro no upload:', error);
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Erro ao fazer upload',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleRemove = (field: keyof BrandingAssets) => {
    onUpdate(field, null);
    toast({
      title: 'Arquivo removido',
      description: 'O arquivo foi removido. Salve para aplicar.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Identidade Visual</CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Faça upload de logos e imagens de marca
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Logo Principal */}
        <FileUpload
          type="logo"
          label="Logo Principal"
          description="Esta logo aparecerá em todos os menus (admin, professor, aluno) e páginas públicas. Formatos: PNG, JPG, SVG, WEBP. Máximo 5MB."
          currentUrl={assets.logoUrl}
          onUpload={(file) => {
            setUploadingLogo(true);
            return handleUpload(file, 'logo', 'logoUrl').finally(() =>
              setUploadingLogo(false)
            );
          }}
          onRemove={() => handleRemove('logoUrl')}
          isUploading={uploadingLogo}
        />

        {/* Favicon */}
        <FileUpload
          type="favicon"
          label="Favicon"
          description="Ícone que aparece na aba do navegador. Formatos: ICO, PNG, SVG. Máximo 1MB."
          currentUrl={assets.faviconUrl}
          onUpload={(file) => {
            setUploadingFavicon(true);
            return handleUpload(file, 'favicon', 'faviconUrl').finally(() =>
              setUploadingFavicon(false)
            );
          }}
          onRemove={() => handleRemove('faviconUrl')}
          isUploading={uploadingFavicon}
        />

        {/* Background de Login */}
        <FileUpload
          type="image"
          label="Background de Login"
          description="Imagem de fundo da tela de login. Formatos: PNG, JPG, WEBP. Máximo 10MB."
          currentUrl={assets.loginBgUrl}
          onUpload={(file) => {
            setUploadingLoginBg(true);
            return handleUpload(file, 'loginBg', 'loginBgUrl').finally(() =>
              setUploadingLoginBg(false)
            );
          }}
          onRemove={() => handleRemove('loginBgUrl')}
          isUploading={uploadingLoginBg}
          maxSizeMB={10}
        />

        {/* Promoted Course Selector */}
        <div className="space-y-3">
          <Label>Curso Promovido (Login/Registro)</Label>
          <Select
            value={assets.promotedCourseId || 'none'}
            onValueChange={(value) =>
              onUpdate('promotedCourseId', value === 'none' ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um curso para promover" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Este curso aparecerá em destaque nas páginas de autenticação.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
