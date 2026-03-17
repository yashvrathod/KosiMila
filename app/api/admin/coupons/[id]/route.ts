import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    requireAdmin(request);

    const body = (await request.json()) as {
      code?: string;
      description?: string | null;
      type?: "PERCENT" | "FLAT";
      value?: number;
      minOrder?: number | null;
      maxDiscount?: number | null;
      active?: boolean;
      startsAt?: string | null;
      endsAt?: string | null;
      usageLimit?: number | null;
    };

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code ? body.code.trim().toUpperCase() : undefined,
        description: body.description === null ? undefined : body.description,
        type: body.type,
        value: body.value === undefined ? undefined : Number(body.value),
        minOrder: body.minOrder === null ? undefined : body.minOrder === undefined ? undefined : Number(body.minOrder),
        maxDiscount: body.maxDiscount === null ? undefined : body.maxDiscount === undefined ? undefined : Number(body.maxDiscount),
        active: body.active,
        startsAt: body.startsAt === null ? undefined : body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt === null ? undefined : body.endsAt ? new Date(body.endsAt) : undefined,
        usageLimit: body.usageLimit === null ? undefined : body.usageLimit === undefined ? undefined : Number(body.usageLimit),
      },
    });

    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    requireAdmin(request);

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: "Coupon deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
