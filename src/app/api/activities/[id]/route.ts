import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: id },
      include: {
        submissions:
          session.user.role === 'STUDENT'
            ? {
                where: {
                  studentId: session.user.id,
                },
              }
            : {
                include: {
                  student: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Atividade não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar atividade' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (
      !session ||
      (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    const activity = await prisma.activity.update({
      where: { id: id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxScore: data.maxScore,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar atividade' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (
      !session ||
      (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.activity.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar atividade' },
      { status: 500 }
    );
  }
}
