/**
 * ============================================
 * ADMIN SYSTEM THEME API - TEMA GLOBAL
 * ============================================
 *
 * PUT: Atualiza tema global do sistema (SystemConfig)
 * DELETE: Reset para Academic Blue
 *
 * IMPORTANTE: Este tema afeta:
 * - Rotas públicas (/, /courses, /login)
 * - Área administrativa (/admin/*)
 * - Fallback para teacher/student
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// ============================================
// SCHEMA ZOD
// ============================================

const updateSystemThemeSchema = z.object({
  themePresetId: z.enum([
    'academic-blue',
    'forest-green',
    'sunset-orange',
    'royal-purple',
    'ocean-teal',
    'crimson-red',
  ]),
});

// ============================================
// PUT - ATUALIZAR TEMA GLOBAL
// ============================================

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar o tema global' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar com Zod
    const result = updateSystemThemeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { themePresetId } = result.data;

    // Atualizar SystemConfig (upsert pelo campo 'key' único)
    await prisma.systemConfig.upsert({
      where: { key: 'system' }, // Buscar pelo campo único 'key'
      create: {
        key: 'system',
        themePresetId,
        companyName: 'SM Educacional',
        systemName: 'SM Educacional',
      },
      update: {
        themePresetId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      data: { themePresetId },
      message: 'Tema global atualizado com sucesso',
    });
  } catch (error) {
    console.error('[PUT /api/admin/system-theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tema global' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - RESETAR TEMA PARA ACADEMIC BLUE
// ============================================

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem resetar o tema global' },
        { status: 403 }
      );
    }

    // Resetar SystemConfig para Academic Blue
    await prisma.systemConfig.upsert({
      where: { key: 'system' }, // Buscar pelo campo único 'key'
      create: {
        key: 'system',
        themePresetId: 'academic-blue',
        companyName: 'SM Educacional',
        systemName: 'SM Educacional',
      },
      update: {
        themePresetId: 'academic-blue',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      data: { themePresetId: 'academic-blue' },
      message: 'Tema global resetado para Academic Blue',
    });
  } catch (error) {
    console.error('[DELETE /api/admin/system-theme] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar tema global' },
      { status: 500 }
    );
  }
}
