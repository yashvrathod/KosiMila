import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = (await request.json()) as { name?: string; phone?: string | null };

    if (!body.name && body.phone === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.phone !== undefined ? { phone: body.phone ?? null } : {}),
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
