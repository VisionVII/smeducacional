import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar certificados" },
      { status: 500 }
    );
  }
}
