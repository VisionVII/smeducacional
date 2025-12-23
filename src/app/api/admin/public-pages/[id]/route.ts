import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updatePageSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  bannerUrl: z.string().optional().or(z.literal('')),
  iconUrl: z.string().optional().or(z.literal('')),
  content: z.any().optional(),
  isPublished: z.boolean().optional(),
});

// GET - Detalhes da página
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const page = await prisma.publicPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error('[API /admin/public-pages/[id] GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar página' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar página
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const result = updatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id } = await params;

    const {
      slug,
      title,
      description,
      bannerUrl,
      iconUrl,
      content,
      isPublished,
    } = result.data;

    // Verificar se página existe
    const existingPage = await prisma.publicPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    // Se mudou slug, verificar se não conflita
    if (slug && slug !== existingPage.slug) {
      const slugConflict = await prisma.publicPage.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Já existe uma página com este slug' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl || null;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl || null;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !existingPage.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    updateData.version = existingPage.version + 1;

    const page = await prisma.publicPage.update({
      where: { id },
      data: updateData,
    });

    // Log da atualização
    await prisma.publicPageLog.create({
      data: {
        pageId: page.id,
        userId: session.user.id,
        action: 'UPDATE',
        changes: updateData,
      },
    });

    return NextResponse.json({
      data: page,
      message: 'Página atualizada com sucesso',
    });
  } catch (error) {
    console.error('[API /admin/public-pages/[id] PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar página' },
      { status: 500 }
    );
  }
}

// DELETE - Remover página
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const page = await prisma.publicPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    // Deletar logs primeiro (cascade)
    await prisma.publicPageLog.deleteMany({
      where: { pageId: id },
    });

    await prisma.publicPage.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Página removida com sucesso',
    });
  } catch (error) {
    console.error('[API /admin/public-pages/[id] DELETE]', error);
    return NextResponse.json(
      { error: 'Erro ao remover página' },
      { status: 500 }
    );
  }
}
