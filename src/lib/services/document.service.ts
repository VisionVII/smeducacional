/**
 * DocumentService - Gerenciamento de documentos dos cursos
 * VisionVII Enterprise Governance 3.0
 *
 * Responsabilidades:
 * - Upload seguro de documentos (PDF, DOCX, XLSX, PPTX)
 * - Validação de acesso (apenas professores do curso podem subir)
 * - Geração de URLs assinadas para download
 * - Verificação de matrícula (alunos só baixam se matriculados)
 * - Soft delete e auditoria completa
 */

import { prisma } from '@/lib/db';
import { EnrollmentStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { logAuditTrail, AuditAction } from '@/lib/audit.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tipos MIME permitidos para documentos
const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50 MB
const DOCUMENTS_BUCKET = 'course-documents';

interface UploadDocumentParams {
  file: File;
  courseId: string;
  moduleId?: string;
  userId: string;
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  ipAddress?: string;
}

interface UploadDocumentResult {
  success: boolean;
  documentId?: string;
  message: string;
  error?: string;
}

interface GenerateDownloadUrlParams {
  documentId: string;
  userId: string;
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  ipAddress?: string;
}

interface GenerateDownloadUrlResult {
  success: boolean;
  signedUrl?: string;
  fileName?: string;
  message: string;
  error?: string;
}

/**
 * Upload de documento do curso (apenas TEACHER ou ADMIN)
 */
export async function uploadDocument({
  file,
  courseId,
  moduleId,
  userId,
  userRole,
  ipAddress,
}: UploadDocumentParams): Promise<UploadDocumentResult> {
  try {
    // 1. Validação de tipo MIME
    if (!ALLOWED_DOCUMENT_MIMES.includes(file.type)) {
      await logAuditTrail({
        userId,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'DOCUMENT_UPLOAD',
        metadata: {
          reason: 'INVALID_MIME_TYPE',
          providedType: file.type,
          fileName: file.name,
          courseId,
        },
        ipAddress,
      });
      return {
        success: false,
        message: 'Tipo de arquivo não permitido',
        error: 'INVALID_MIME',
      };
    }

    // 2. Validação de tamanho
    if (file.size > MAX_DOCUMENT_SIZE) {
      await logAuditTrail({
        userId,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'DOCUMENT_UPLOAD',
        metadata: {
          reason: 'FILE_TOO_LARGE',
          size: file.size,
          maxSize: MAX_DOCUMENT_SIZE,
          fileName: file.name,
          courseId,
        },
        ipAddress,
      });
      return {
        success: false,
        message: 'Arquivo muito grande. Máximo: 50 MB',
        error: 'FILE_TOO_LARGE',
      };
    }

    // 3. Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true, title: true },
    });

    if (!course) {
      return {
        success: false,
        message: 'Curso não encontrado',
        error: 'COURSE_NOT_FOUND',
      };
    }

    // 4. Verificar permissão: apenas instrutor do curso ou ADMIN
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      await logAuditTrail({
        userId,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'DOCUMENT_UPLOAD',
        metadata: {
          reason: 'UNAUTHORIZED_UPLOAD',
          courseId,
          instructorId: course.instructorId,
        },
        ipAddress,
      });
      return {
        success: false,
        message: 'Você não tem permissão para subir documentos neste curso',
        error: 'UNAUTHORIZED',
      };
    }

    // 5. Se moduleId foi informado, validar que pertence ao curso
    if (moduleId) {
      const module = await prisma.module.findFirst({
        where: { id: moduleId, courseId, deletedAt: null },
      });
      if (!module) {
        return {
          success: false,
          message: 'Módulo não encontrado neste curso',
          error: 'MODULE_NOT_FOUND',
        };
      }
    }

    // 6. Gerar UUID para armazenamento (evita colisão de nomes)
    const fileExtension = file.name.split('.').pop() || 'bin';
    const uniqueId = crypto.randomUUID();
    const storagePath = `documents/courses/${courseId}/${uniqueId}.${fileExtension}`;

    // 7. Upload para Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('[DocumentService] Erro no upload Supabase:', uploadError);
      return {
        success: false,
        message: 'Erro ao fazer upload do arquivo',
        error: 'UPLOAD_FAILED',
      };
    }

    // 8. Salvar registro no banco (status APPROVED por padrão)
    const document = await prisma.courseDocument.create({
      data: {
        courseId,
        moduleId: moduleId || null,
        uploadedBy: userId,
        fileName: file.name,
        storagePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'APPROVED', // Pode ser PENDING_SCAN se antivírus for implementado
      },
    });

    // 9. Log de auditoria
    await logAuditTrail({
      userId,
      action: AuditAction.CONTENT_ACCESS,
      targetType: 'DOCUMENT_UPLOAD',
      targetId: document.id,
      metadata: {
        courseId,
        moduleId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath,
      },
      ipAddress,
    });

    return {
      success: true,
      documentId: document.id,
      message: 'Documento enviado com sucesso',
    };
  } catch (error) {
    console.error('[DocumentService] uploadDocument error:', error);
    return {
      success: false,
      message: 'Erro interno ao processar upload',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Gerar URL assinada para download (apenas alunos matriculados ou autor)
 */
export async function generateDownloadUrl({
  documentId,
  userId,
  userRole,
  ipAddress,
}: GenerateDownloadUrlParams): Promise<GenerateDownloadUrlResult> {
  try {
    // 1. Buscar documento
    const document = await prisma.courseDocument.findUnique({
      where: { id: documentId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
            title: true,
          },
        },
      },
    });

    if (!document || document.deletedAt) {
      return {
        success: false,
        message: 'Documento não encontrado',
        error: 'DOCUMENT_NOT_FOUND',
      };
    }

    // 2. Verificar status do documento
    if (document.status === 'REJECTED') {
      return {
        success: false,
        message: 'Este documento foi rejeitado e não pode ser baixado',
        error: 'DOCUMENT_REJECTED',
      };
    }

    if (document.status === 'PENDING_SCAN') {
      return {
        success: false,
        message: 'Documento em análise de segurança. Tente novamente em breve.',
        error: 'DOCUMENT_PENDING',
      };
    }

    // 3. Verificar permissão de acesso
    let hasAccess = false;

    if (userRole === 'ADMIN') {
      // Admin tem acesso total
      hasAccess = true;
    } else if (userRole === 'TEACHER' && document.uploadedBy === userId) {
      // Professor que subiu o documento
      hasAccess = true;
    } else if (
      userRole === 'TEACHER' &&
      document.course.instructorId === userId
    ) {
      // Professor do curso
      hasAccess = true;
    } else if (userRole === 'STUDENT') {
      // Aluno: precisa estar matriculado no curso
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: userId,
          courseId: document.courseId,
          status: EnrollmentStatus.ACTIVE,
        },
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      await logAuditTrail({
        userId,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'DOCUMENT_DOWNLOAD',
        targetId: documentId,
        metadata: {
          reason: 'UNAUTHORIZED_DOWNLOAD',
          courseId: document.courseId,
        },
        ipAddress,
      });
      return {
        success: false,
        message: 'Você não tem acesso a este documento',
        error: 'UNAUTHORIZED',
      };
    }

    // 4. Gerar URL assinada (1 hora de validade)
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(document.storagePath, 3600); // 1 hora

    if (error || !data) {
      console.error('[DocumentService] Erro ao gerar signed URL:', error);
      return {
        success: false,
        message: 'Erro ao gerar link de download',
        error: 'SIGNED_URL_FAILED',
      };
    }

    // 5. Log de auditoria
    await logAuditTrail({
      userId,
      action: AuditAction.CONTENT_ACCESS,
      targetType: 'DOCUMENT_DOWNLOAD',
      targetId: documentId,
      metadata: {
        courseId: document.courseId,
        moduleId: document.moduleId,
        fileName: document.fileName,
      },
      ipAddress,
    });

    return {
      success: true,
      signedUrl: data.signedUrl,
      fileName: document.fileName,
      message: 'URL gerada com sucesso',
    };
  } catch (error) {
    console.error('[DocumentService] generateDownloadUrl error:', error);
    return {
      success: false,
      message: 'Erro interno ao gerar link de download',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Listar documentos de um curso (com filtro opcional por módulo)
 */
export async function listCourseDocuments(
  courseId: string,
  moduleId?: string,
  userRole?: 'ADMIN' | 'TEACHER' | 'STUDENT'
) {
  const where: any = {
    courseId,
    deletedAt: null,
  };

  // Se moduleId informado, filtrar
  if (moduleId) {
    where.moduleId = moduleId;
  }

  // Estudantes só veem documentos aprovados
  if (userRole === 'STUDENT') {
    where.status = 'APPROVED';
  }

  return prisma.courseDocument.findMany({
    where,
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      status: true,
      moduleId: true,
      createdAt: true,
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Soft delete de documento (apenas autor ou ADMIN)
 */
export async function deleteDocument(
  documentId: string,
  userId: string,
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT',
  ipAddress?: string
) {
  try {
    const document = await prisma.courseDocument.findUnique({
      where: { id: documentId },
      select: { id: true, uploadedBy: true, deletedAt: true },
    });

    if (!document || document.deletedAt) {
      return { success: false, message: 'Documento não encontrado' };
    }

    // Apenas autor ou admin pode deletar
    if (userRole !== 'ADMIN' && document.uploadedBy !== userId) {
      await logAuditTrail({
        userId,
        action: AuditAction.SECURITY_VIOLATION,
        targetType: 'DOCUMENT_DELETE',
        targetId: documentId,
        metadata: { reason: 'UNAUTHORIZED_DELETE' },
        ipAddress,
      });
      return {
        success: false,
        message: 'Você não tem permissão para deletar este documento',
      };
    }

    // Soft delete
    await prisma.courseDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    await logAuditTrail({
      userId,
      action: AuditAction.CONTENT_ACCESS,
      targetType: 'DOCUMENT_DELETE',
      targetId: documentId,
      ipAddress,
    });

    return { success: true, message: 'Documento removido com sucesso' };
  } catch (error) {
    console.error('[DocumentService] deleteDocument error:', error);
    return { success: false, message: 'Erro ao deletar documento' };
  }
}
