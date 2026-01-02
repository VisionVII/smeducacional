import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@smeducacional.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    return Response.json(
      {
        found: !!adminUser,
        user: adminUser
          ? {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              hasPassword: !!adminUser.password,
            }
          : null,
        message: adminUser
            ? '✅ Admin user exists'
            : '❌ Admin user not found - run seed: npx prisma db seed',
      },
      {
        status: adminUser ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        message:
          'Database connection error. Check .env and database connection.',
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
