import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    certificateNumber: string;
  }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateNumber } = await params;

  // Buscar certificado
  const certificate = await prisma.certificate.findUnique({
    where: {
      certificateNumber: certificateNumber,
    },
    include: {
      student: {
        select: {
          name: true,
        },
      },
      course: {
        select: {
          title: true,
          duration: true,
        },
      },
    },
  });

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">
              Certificado Inválido
            </CardTitle>
            <CardDescription className="text-red-700">
              Certificado nº {certificateNumber} não encontrado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>
              Este certificado não existe em nossa base de dados ou o número
              está incorreto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const durationHours = certificate.course.duration
    ? Math.ceil(certificate.course.duration / 60)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">
            Certificado Válido
          </CardTitle>
          <CardDescription className="text-green-700">
            Certificado nº {certificate.certificateNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  Certificado de Conclusão
                </h3>
                <p className="text-muted-foreground text-sm">
                  Emitido por SM Educa
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Aluno</p>
                  <p className="font-semibold">{certificate.student.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Curso</p>
                  <p className="font-semibold">{certificate.course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Carga horária: {durationHours} horas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de emissão
                  </p>
                  <p className="font-semibold">
                    {new Date(certificate.issuedAt).toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800">
              ✓ Este certificado é autêntico e foi emitido por nossa plataforma
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
