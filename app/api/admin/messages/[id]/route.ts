import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function validateId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

/* ========================= GET ========================= */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    requireAdmin(request);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid message id" },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        createdAt: true,
        read: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch message";
    const status =
      msg === "Not authenticated" || msg === "Invalid token"
        ? 401
        : msg === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PATCH ========================= */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    requireAdmin(request);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid message id" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { read?: boolean };

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read: body.read ?? true },
    });

    return NextResponse.json({ message: updated });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to update message";
    const status =
      msg === "Not authenticated" || msg === "Invalid token"
        ? 401
        : msg === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PUT (alias) ========================= */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

/* ========================= DELETE ========================= */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    requireAdmin(request);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid message id" },
        { status: 400 }
      );
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to delete message";
    const status =
      msg === "Not authenticated" || msg === "Invalid token"
        ? 401
        : msg === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}
