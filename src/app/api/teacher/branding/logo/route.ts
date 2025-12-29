import { auth } from '@/lib/auth';
import { getTeacherAccessControl } from '@/lib/subscription';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/teacher/branding/logo
 * Upload de logo do professor (requer plano active)
 *
 * Features bloqueadas:
 * - Plano inativo: apenas free plan
 * - Feature gate: canUploadLogo
 *
 * Exemplo de uso:
 * const formData = new FormData();
 * formData.append('file', logoFile);
 * fetch('/api/teacher/branding/logo', { method: 'POST', body: formData })
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // 1. Verificar autenticação
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    // 2. Verificar acesso à feature
    const access = await getTeacherAccessControl(session.user.id);

    if (!access.canUploadLogo) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: `Upload de logo requer plano ${
            access.plan === 'free' ? 'Basic ou superior' : 'ativo'
          }`,
          plan: access.plan,
          subscriptionStatus: access.subscriptionStatus,
          upgrade: 'https://seu-app.com/upgrade', // URL para upgrade
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // 3. Processar upload
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 2MB' },
        { status: 400 }
      );
    }

    // TODO: Aqui você faria o upload real para Supabase Storage
    // const buffer = await file.arrayBuffer();
    // await supabase.storage.from('logos').upload(`${userId}/logo.${ext}`, buffer);

    // 4. Salvar referência no banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Se tiver logo field
        // logo: `https://storage.url/logos/${session.user.id}/logo.png`
      },
      select: { id: true, email: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Logo uploaded successfully',
        fileSize: file.size,
        fileName: file.name,
        // logo: `https://storage.url/logos/${session.user.id}/logo.png`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/branding/logo
 * Retorna URL do logo do professor (público, sem auth necessária)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        // logo: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({
      // logo: user.logo || null,
      teacherId,
    });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}
