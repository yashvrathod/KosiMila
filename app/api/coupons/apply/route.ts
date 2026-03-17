import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { calculateCouponDiscount } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = (await request.json()) as { couponCode: string };

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const result = await calculateCouponDiscount({
      couponCode: body.couponCode,
      subtotal,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      couponCode: result.couponCode,
      subtotal,
      discount: result.discount,
      totalAfterDiscount: subtotal - result.discount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 });
  }
}
