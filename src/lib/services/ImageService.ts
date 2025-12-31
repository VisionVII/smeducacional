/**
 * IMAGE SERVICE - Phase 2.2
 * VisionVII 3.0 Enterprise Governance - Service Pattern
 *
 * Gerencia upload, delete, signed URLs e lifecycle de imagens/vídeos
 * Integrado com Supabase Storage + PostgreSQL
 */

import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { z } from 'zod';

// ============================================================================
// CONFIGURAÇÃO SUPABASE
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// ZOD SCHEMAS & TYPES
// ============================================================================

export const ImageUploadSchema = z.object({
  file: z.instanceof(File),
  bucket: z.enum([
    'course-thumbnails',
    'profile-pictures',
    'videos',
    'public-pages',
  ]),
  userId: z.string(),
  resourceType: z.enum([
    'COURSE',
    'USER',
    'PAGE',
    'LESSON',
    'AD',
    'CERTIFICATE',
    'CONFIG',
  ]),
  resourceId: z.string(),
  fieldName: z.string(),
});

export type ImageUploadInput = z.infer<typeof ImageUploadSchema>;

export const ImageMetadata = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
});

export type ImageMetadataType = z.infer<typeof ImageMetadata>;

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_TYPES: Record<string, string[]> = {
  'course-thumbnails': ['image/jpeg', 'image/png', 'image/webp'],
  'profile-pictures': ['image/jpeg', 'image/png', 'image/webp'],
  'public-pages': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime'],
};

const SIZE_LIMITS: Record<string, number> = {
  'course-thumbnails': 10 * 1024 * 1024, // 10 MB
  'profile-pictures': 5 * 1024 * 1024, // 5 MB
  'public-pages': 10 * 1024 * 1024, // 10 MB
  videos: 100 * 1024 * 1024, // 100 MB
};

const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class ImageServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ImageServiceError';
  }
}

// ============================================================================
// IMAGE SERVICE
// ============================================================================

export class ImageService {
  /**
   * Upload de imagem/vídeo para Supabase Storage
   * Cria registro no banco com metadata e signed URL
   */
  static async uploadImage(input: ImageUploadInput): Promise<{
    id: string;
    signedUrl: string;
    metadata: ImageMetadataType;
  }> {
    try {
      // Validação de input
      const validated = ImageUploadSchema.parse(input);
      const { file, bucket, userId, resourceType, resourceId, fieldName } =
        validated;

      // Validação de tipo de arquivo
      if (!ALLOWED_TYPES[bucket]?.includes(file.type)) {
        throw new ImageServiceError(
          `Tipo de arquivo não permitido: ${file.type}`,
          'INVALID_FILE_TYPE',
          400
        );
      }

      // Validação de tamanho
      if (file.size > SIZE_LIMITS[bucket]) {
        throw new ImageServiceError(
          `Arquivo muito grande. Máximo: ${
            SIZE_LIMITS[bucket] / 1024 / 1024
          }MB`,
          'FILE_TOO_LARGE',
          400
        );
      }

      // Extrair metadata (dimensões, duração)
      const metadata = await this.extractMetadata(file);

      // Gerar path único
      const fileName = file.name;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const slugifiedName = fileName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const path = `${timestamp}-${randomSuffix}-${slugifiedName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new ImageServiceError(
          `Erro ao fazer upload: ${uploadError.message}`,
          'UPLOAD_FAILED',
          500
        );
      }

      // Gerar signed URL
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, SIGNED_URL_EXPIRY);

      if (!urlData?.signedUrl) {
        throw new ImageServiceError(
          'Erro ao gerar URL assinada',
          'SIGNED_URL_FAILED',
          500
        );
      }

      // Criar registro no banco
      const image = await prisma.image.create({
        data: {
          fileName,
          bucket,
          path,
          mimeType: file.type,
          size: file.size,
          width: metadata.width,
          height: metadata.height,
          duration: metadata.duration,
          signedUrl: urlData.signedUrl,
          signedUrlExpiry: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000),
          uploadedBy: userId,
        },
      });

      // Criar registro de uso
      await prisma.imageUsage.create({
        data: {
          imageId: image.id,
          resourceType,
          resourceId,
          fieldName,
        },
      });

      return {
        id: image.id,
        signedUrl: urlData.signedUrl,
        metadata: {
          fileName: image.fileName,
          mimeType: image.mimeType,
          size: image.size,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          duration: image.duration ?? undefined,
        },
      };
    } catch (error) {
      if (error instanceof ImageServiceError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ImageServiceError(
          'Dados de entrada inválidos',
          'VALIDATION_ERROR',
          400
        );
      }
      throw new ImageServiceError(
        'Erro interno ao fazer upload',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  /**
   * Deletar imagem (soft delete)
   * Mantém registro no banco mas marca como deletado
   */
  static async deleteImage(imageId: string, userId: string): Promise<void> {
    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new ImageServiceError(
          'Imagem não encontrada',
          'IMAGE_NOT_FOUND',
          404
        );
      }

      // Verificar permissão (admin ou owner)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN' && image.uploadedBy !== userId) {
        throw new ImageServiceError(
          'Sem permissão para deletar esta imagem',
          'PERMISSION_DENIED',
          403
        );
      }

      // Soft delete no banco
      await prisma.image.update({
        where: { id: imageId },
        data: { deletedAt: new Date() },
      });

      // Opcional: deletar do Supabase Storage (comentado para permitir recovery)
      // await supabase.storage.from(image.bucket).remove([image.path]);
    } catch (error) {
      if (error instanceof ImageServiceError) {
        throw error;
      }
      throw new ImageServiceError(
        'Erro ao deletar imagem',
        'DELETE_FAILED',
        500
      );
    }
  }

  /**
   * Obter signed URL (com cache de 1 hora)
   * Se expirado, gera novo e atualiza no banco
   */
  static async getSignedUrl(imageId: string): Promise<string> {
    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image || image.deletedAt) {
        throw new ImageServiceError(
          'Imagem não encontrada',
          'IMAGE_NOT_FOUND',
          404
        );
      }

      // Verificar se cache ainda é válido
      if (
        image.signedUrl &&
        image.signedUrlExpiry &&
        image.signedUrlExpiry > new Date()
      ) {
        return image.signedUrl;
      }

      // Gerar novo signed URL
      const { data: urlData, error } = await supabase.storage
        .from(image.bucket)
        .createSignedUrl(image.path, SIGNED_URL_EXPIRY);

      if (error || !urlData?.signedUrl) {
        throw new ImageServiceError(
          'Erro ao gerar URL assinada',
          'SIGNED_URL_FAILED',
          500
        );
      }

      // Atualizar cache no banco
      await prisma.image.update({
        where: { id: imageId },
        data: {
          signedUrl: urlData.signedUrl,
          signedUrlExpiry: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000),
        },
      });

      return urlData.signedUrl;
    } catch (error) {
      if (error instanceof ImageServiceError) {
        throw error;
      }
      throw new ImageServiceError('Erro ao obter URL', 'GET_URL_FAILED', 500);
    }
  }

  /**
   * Atualizar uso de imagem
   * Adiciona novo relacionamento image -> resource
   */
  static async updateImageUsage(
    imageId: string,
    resourceType: string,
    resourceId: string,
    fieldName: string
  ): Promise<void> {
    try {
      await prisma.imageUsage.upsert({
        where: {
          imageId_resourceType_resourceId_fieldName: {
            imageId,
            resourceType,
            resourceId,
            fieldName,
          },
        },
        update: {},
        create: {
          imageId,
          resourceType,
          resourceId,
          fieldName,
        },
      });
    } catch {
      throw new ImageServiceError(
        'Erro ao atualizar uso da imagem',
        'UPDATE_USAGE_FAILED',
        500
      );
    }
  }

  /**
   * Encontrar imagens órfãs (sem usages)
   * Útil para cleanup jobs
   */
  static async findOrphanedImages(daysOld: number = 7): Promise<
    Array<{
      id: string;
      fileName: string;
      bucket: string;
      size: number;
      createdAt: Date;
    }>
  > {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const orphanedImages = await prisma.image.findMany({
        where: {
          deletedAt: null,
          createdAt: {
            lte: cutoffDate,
          },
          usages: {
            none: {},
          },
        },
        select: {
          id: true,
          fileName: true,
          bucket: true,
          size: true,
          createdAt: true,
        },
      });

      return orphanedImages;
    } catch {
      throw new ImageServiceError(
        'Erro ao buscar imagens órfãs',
        'FIND_ORPHANED_FAILED',
        500
      );
    }
  }

  /**
   * Cleanup de imagens órfãs
   * Soft delete de imagens sem usages
   */
  static async cleanupOrphanedImages(daysOld: number = 30): Promise<number> {
    try {
      const orphaned = await this.findOrphanedImages(daysOld);

      const result = await prisma.image.updateMany({
        where: {
          id: {
            in: orphaned.map((img) => img.id),
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return result.count;
    } catch {
      throw new ImageServiceError(
        'Erro ao limpar imagens órfãs',
        'CLEANUP_FAILED',
        500
      );
    }
  }

  /**
   * Obter metadata completa de uma imagem
   */
  static async getImageMetadata(imageId: string): Promise<{
    id: string;
    fileName: string;
    bucket: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
    uploadedBy: string;
    createdAt: Date;
    usages: Array<{
      resourceType: string;
      resourceId: string;
      fieldName: string;
    }>;
  } | null> {
    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
        include: {
          usages: {
            select: {
              resourceType: true,
              resourceId: true,
              fieldName: true,
            },
          },
        },
      });

      if (!image || image.deletedAt) {
        return null;
      }

      return {
        id: image.id,
        fileName: image.fileName,
        bucket: image.bucket,
        mimeType: image.mimeType,
        size: image.size,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
        duration: image.duration ?? undefined,
        uploadedBy: image.uploadedBy,
        createdAt: image.createdAt,
        usages: image.usages,
      };
    } catch {
      throw new ImageServiceError(
        'Erro ao obter metadata',
        'GET_METADATA_FAILED',
        500
      );
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extrair metadata de arquivo (dimensões, duração)
   */
  private static async extractMetadata(file: File): Promise<ImageMetadataType> {
    try {
      const metadata: ImageMetadataType = {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      };

      // Para imagens, extrair dimensões com sharp
      if (file.type.startsWith('image/')) {
        try {
          const buffer = await file.arrayBuffer();
          const image = sharp(Buffer.from(buffer));
          const imageMetadata = await image.metadata();

          metadata.width = imageMetadata.width;
          metadata.height = imageMetadata.height;
        } catch (error) {
          // Se falhar, continuar sem dimensões
          console.error('Erro ao extrair dimensões:', error);
        }
      }

      // Para vídeos, duração pode ser extraída no frontend antes do upload
      // Ou usar biblioteca como ffprobe (adicionar depois se necessário)

      return metadata;
    } catch {
      throw new ImageServiceError(
        'Erro ao extrair metadata',
        'METADATA_EXTRACTION_FAILED',
        500
      );
    }
  }
}
