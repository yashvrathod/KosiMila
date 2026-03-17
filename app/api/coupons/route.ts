import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { calculateCouponDiscount } from "@/lib/coupons";

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = getUserId(request);
    } catch {
      userId = null;
    }

    // Current cart subtotal for applicability (if logged in)
    let subtotal = 0;
    if (userId) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        AND: [
          { OR: [ { startsAt: null }, { startsAt: { lte: now } } ] },
          { OR: [ { endsAt: null }, { endsAt: { gte: now } } ] },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const detailed = await Promise.all(
      coupons.map(async (c) => {
        const result = await calculateCouponDiscount({ couponCode: c.code, subtotal });
        const short = c.description || (c.type === "PERCENT" ? `${c.value}% off` : `₹${c.value} off`);
        return {
          code: c.code,
          description: short,
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          maxDiscount: c.maxDiscount,
          endsAt: c.endsAt,
          applicable: result.ok,
          reason: result.ok ? undefined : result.reason,
          discount: result.ok ? result.discount : 0,
        };
      })
    );

    const applicable = detailed.filter((d) => d.applicable).sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    const others = detailed.filter((d) => !d.applicable);

    return NextResponse.json({ subtotal, applicable, others });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
