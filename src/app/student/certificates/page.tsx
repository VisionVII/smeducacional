'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  completionDate: string;
  courseHours: number;
  certificateUrl?: string;
}

export default function StudentCertificatesPage() {
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const res = await fetch('/api/student/certificates');
      if (!res.ok) throw new Error('Erro ao carregar certificados');
      return res.json();
    },
  });

  const handleDownload = async (certificateId: string, courseTitle: string) => {
    try {
      toast({
        title: 'Gerando certificado...',
        description: 'Por favor, aguarde.',
      });

      const res = await fetch(
        `/api/student/certificates/${certificateId}/download`
      );

      if (!res.ok) {
        throw new Error('Erro ao baixar certificado');
      }

      // Converter resposta em blob
      const blob = await res.blob();

      // Criar URL temporária
      const url = window.URL.createObjectURL(blob);

      // Criar link temporário e clicar
      const a = document.createElement('a');
      a.href = url;
      const safeCourseTitle = courseTitle || 'curso';
      a.download = `certificado-${safeCourseTitle
        .replace(/\s+/g, '-')
        .toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Sucesso!',
        description: 'Certificado baixado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o certificado.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Certificados</h1>
        <p className="text-muted-foreground">
          Certificados dos cursos que você completou
        </p>
      </div>

      {certificates && certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum certificado ainda
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              Complete seus cursos para receber certificados de conclusão
            </p>
            <Button asChild>
              <Link href="/student/courses">Ver Meus Cursos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates?.map((certificate) => (
            <Card
              key={certificate.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {certificate.courseTitle}
                </CardTitle>
                <CardDescription>
                  Emitido em{' '}
                  {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conclusão:</span>
                    <span className="font-medium">
                      {new Date(certificate.completionDate).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Carga horária:
                    </span>
                    <span className="font-medium">
                      {certificate.courseHours}h
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleDownload(certificate.id, certificate.courseTitle)
                    }
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
