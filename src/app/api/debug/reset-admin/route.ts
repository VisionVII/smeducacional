import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('[reset-admin] Iniciando reset do admin user...');

    const adminPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'admin@smeducacional.com' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        name: 'Administrador',
        emailVerified: new Date(),
      },
      create: {
        email: 'admin@smeducacional.com',
        password: adminPassword,
        role: 'ADMIN',
        name: 'Administrador',
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('[reset-admin] Admin user resetado com sucesso:', user);

    return Response.json(
      {
        success: true,
        user,
        credentials: {
          email: 'admin@smeducacional.com',
          password: 'admin123',
        },
        message:
          '✅ Admin user reset successfully. Use the credentials above to login.',
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[reset-admin] Erro:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to reset admin user',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
