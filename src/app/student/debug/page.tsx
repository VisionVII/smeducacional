'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DebugData {
  session: any;
  user?: any;
  enrollments: any[];
  enrollmentCount?: number;
  totalEnrollmentsInDB?: number;
  totalCoursesInDB?: number;
  error?: string;
}

export default function StudentDebugPage() {
  const { data: session } = useSession();
  const [debug, setDebug] = useState<DebugData>({
    session: null,
    enrollments: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDebug = async () => {
      try {
        const res = await fetch('/api/student/enrollments-debug');
        const data = await res.json();
        setDebug(data);
      } catch (error) {
        setDebug({
          session: null,
          enrollments: [],
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchDebug();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Debug - Student Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              ❌ Não autenticado. Faça login primeiro.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Ir para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Sessão Atual</CardTitle>
            <CardDescription>Dados da autenticação</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-48">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug API Response</CardTitle>
            <CardDescription>
              Resposta de /api/student/enrollments-debug
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando...</p>
            ) : debug.error ? (
              <p className="text-red-500">❌ Erro: {debug.error}</p>
            ) : (
              <div className="space-y-4">
                {debug.user && (
                  <div>
                    <h3 className="font-semibold mb-2">👤 Usuário:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm">
                      {JSON.stringify(debug.user, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">
                    📚 Enrollments ({debug.enrollmentCount || 0}):
                  </h3>
                  {debug.enrollmentCount === 0 ? (
                    <p className="text-yellow-600">
                      ⚠️ Nenhum enrollment encontrado
                    </p>
                  ) : (
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-48">
                      {JSON.stringify(debug.enrollments, null, 2)}
                    </pre>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-100 rounded">
                    <p className="text-sm text-gray-600">
                      Total Enrollments no DB
                    </p>
                    <p className="text-2xl font-bold">
                      {debug.totalEnrollmentsInDB || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded">
                    <p className="text-sm text-gray-600">Total Courses no DB</p>
                    <p className="text-2xl font-bold">
                      {debug.totalCoursesInDB || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/dashboard">Ir para Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/courses">Ir para Meus Cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
