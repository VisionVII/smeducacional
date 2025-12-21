import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile, deleteFile } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${session.user.id}-${timestamp}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    // Deletar avatar anterior se existir
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (currentUser?.avatar) {
      const oldPath = currentUser.avatar.split('/images/').pop();
      if (oldPath && oldPath.startsWith('avatars/')) {
        await deleteFile('images', oldPath);
      }
    }

    // Upload para Supabase Storage
    const { url, error } = await uploadFile(file, 'images', filePath);

    if (error || !url) {
      console.error('[student][avatar] Erro no upload Supabase:', error);
      return NextResponse.json(
        { error: error || 'Erro ao fazer upload de avatar' },
        { status: 500 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: url },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: url,
      message: 'Avatar atualizado com sucesso',
    });
  } catch (error) {
    console.error('[student][avatar] Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload de avatar' },
      { status: 500 }
    );
  }
}
