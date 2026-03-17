import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId(request);
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string | null;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    };

    const address = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({ where: { id, userId } });
      if (!existing) return null;

      if (body.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.update({
        where: { id },
        data: {
          name: body.name,
          phone: body.phone,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2 === null ? undefined : body.addressLine2,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          isDefault: body.isDefault,
        },
      });
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId(request);

    const existing = await prisma.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ message: "Address deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
