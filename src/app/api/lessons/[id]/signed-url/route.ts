import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { supabaseService } from '@/lib/supabase-service';

// Extrai o path interno do Supabase a partir de uma URL pública
function extractSupabasePath(url: string): string | null {
  // Exemplo: https://<project>.supabase.co/storage/v1/object/public/course-videos/videos/file.mp4
  const match = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const bucket = match[1];
  const path = match[2];
  return `${bucket}/${path}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    if (!lesson.videoUrl) {
      return NextResponse.json(
        { error: 'Aula sem vídeo configurado' },
        { status: 400 }
      );
    }

    // Autorização: professor dono, admin, ou aluno matriculado
    const isTeacherOwner =
      lesson.module.course.instructorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    let isStudentEnrolled = false;

    if (session.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: lesson.module.course.id,
          },
        },
      });
      isStudentEnrolled = Boolean(enrollment);
    }

    if (!isTeacherOwner && !isAdmin && !isStudentEnrolled) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar esta aula' },
        { status: 403 }
      );
    }

    // Se não for arquivo Supabase, devolve a própria URL (ex.: YouTube/Vimeo)
    if (!lesson.videoUrl.includes('supabase.co')) {
      return NextResponse.json({ data: { signedUrl: lesson.videoUrl } });
    }

    const storagePath = extractSupabasePath(lesson.videoUrl);
    if (!storagePath) {
      return NextResponse.json(
        { error: 'URL de vídeo inválida ou fora do padrão Supabase' },
        { status: 400 }
      );
    }

    // createSignedUrl requer bucket e path separados
    const [bucket, ...pathParts] = storagePath.split('/');
    const path = pathParts.join('/');

    const { data, error } = await supabaseService.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60); // 1h

    if (error || !data?.signedUrl) {
      console.error('[SIGNED_URL] Erro ao gerar URL assinada:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar URL assinada' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { signedUrl: data.signedUrl } });
  } catch (error) {
    console.error('[SIGNED_URL] Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de vídeo' },
      { status: 500 }
    );
  }
}
