import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { prisma } from '@/lib/db';

/**
 * Gera um certificado PDF para um curso concluído
 */
export async function generateCertificatePDF(
  certificateId: string
): Promise<Buffer> {
  // Buscar dados do certificado
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          duration: true,
          instructor: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    throw new Error('Certificado não encontrado');
  }

  // Criar PDF (A4 landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cor primária VisionVII (ajustar conforme identidade visual)
  const primaryColor: [number, number, number] = [59, 130, 246]; // blue-500

  // ========== BORDAS DECORATIVAS ==========
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // ========== CABEÇALHO ==========
  doc.setFontSize(32);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('DE CONCLUSÃO', pageWidth / 2, 50, { align: 'center' });

  // ========== CORPO ==========
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Certificamos que', pageWidth / 2, 70, { align: 'center' });

  // Nome do aluno (destaque)
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(certificate.student.name, pageWidth / 2, 85, { align: 'center' });

  // Texto descritivo
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('concluiu com êxito o curso', pageWidth / 2, 100, {
    align: 'center',
  });

  // Nome do curso (destaque)
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');

  // Quebrar texto longo do curso
  const courseTitle = doc.splitTextToSize(
    certificate.course.title,
    pageWidth - 60
  );
  doc.text(courseTitle, pageWidth / 2, 115, { align: 'center' });

  // Carga horária
  const durationHours = certificate.course.duration
    ? Math.ceil(certificate.course.duration / 60)
    : 0;
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`com carga horária de ${durationHours} horas`, pageWidth / 2, 130, {
    align: 'center',
  });

  // Data de emissão
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );
  doc.text(`Emitido em ${issuedDate}`, pageWidth / 2, 140, { align: 'center' });

  // ========== RODAPÉ ==========
  // Instrutor
  const instructorY = pageHeight - 50;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('_______________________________', pageWidth / 4, instructorY, {
    align: 'center',
  });
  doc.text(certificate.course.instructor.name, pageWidth / 4, instructorY + 5, {
    align: 'center',
  });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Instrutor', pageWidth / 4, instructorY + 10, { align: 'center' });

  // VisionVII
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    '_______________________________',
    (pageWidth * 3) / 4,
    instructorY,
    {
      align: 'center',
    }
  );
  doc.text('SM Educacional', (pageWidth * 3) / 4, instructorY + 5, {
    align: 'center',
  });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('VisionVII', (pageWidth * 3) / 4, instructorY + 10, {
    align: 'center',
  });

  // ========== QR CODE ==========
  // Gerar URL de verificação
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-certificate/${certificate.certificateNumber}`;

  try {
    // Gerar QR Code como data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Adicionar QR Code ao PDF
    const qrSize = 25;
    doc.addImage(
      qrCodeDataUrl,
      'PNG',
      pageWidth - 45,
      pageHeight - 45,
      qrSize,
      qrSize
    );

    // Texto abaixo do QR Code
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Verificar autenticidade', pageWidth - 32.5, pageHeight - 15, {
      align: 'center',
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    // Continuar sem QR Code se houver erro
  }

  // Número do certificado (canto inferior esquerdo)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Certificado Nº ${certificate.certificateNumber}`,
    20,
    pageHeight - 15
  );

  // Retornar buffer do PDF
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Gera número único de certificado
 */
export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

/**
 * Verifica se aluno completou curso e pode receber certificado
 */
export async function canIssueCertificate(
  userId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: userId,
      courseId: courseId,
      status: 'COMPLETED',
    },
  });

  if (!enrollment) {
    return false;
  }

  // Verificar se já existe certificado
  const existingCertificate = await prisma.certificate.findFirst({
    where: {
      studentId: userId,
      courseId: courseId,
    },
  });

  return !existingCertificate;
}

/**
 * Emite certificado para um aluno
 */
export async function issueCertificate(
  userId: string,
  courseId: string
): Promise<string> {
  // Verificar se pode emitir
  const canIssue = await canIssueCertificate(userId, courseId);

  if (!canIssue) {
    throw new Error('Certificado já foi emitido ou curso não foi completado');
  }

  // Criar certificado
  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber: generateCertificateNumber(),
      studentId: userId,
      courseId: courseId,
    },
  });

  return certificate.id;
}
