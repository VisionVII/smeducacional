import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Verificar se a formação pertence ao usuário
    const education = await prisma.teacherEducation.findUnique({
      where: { id: (await params).id },
    });

    if (!education) {
      return NextResponse.json(
        { error: 'Formação não encontrada' },
        { status: 404 }
      );
    }

    if (education.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para remover esta formação' },
        { status: 403 }
      );
    }

    await prisma.teacherEducation.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({
      success: true,
      message: 'Formação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover formação:', error);
    return NextResponse.json(
      { error: 'Erro ao remover formação' },
      { status: 500 }
    );
  }
}
