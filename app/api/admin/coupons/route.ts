import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = (await request.json()) as {
      code: string;
      description?: string;
      type: "PERCENT" | "FLAT";
      value: number;
      minOrder?: number;
      maxDiscount?: number;
      active?: boolean;
      startsAt?: string;
      endsAt?: string;
      usageLimit?: number;
    };

    const code = (body.code || "").trim().toUpperCase();
    if (!code || !body.type || !Number.isFinite(Number(body.value))) {
      return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: body.description,
        type: body.type,
        value: Number(body.value),
        minOrder: body.minOrder === undefined ? undefined : Number(body.minOrder),
        maxDiscount:
          body.maxDiscount === undefined ? undefined : Number(body.maxDiscount),
        active: body.active ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        usageLimit: body.usageLimit === undefined ? undefined : Number(body.usageLimit),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
