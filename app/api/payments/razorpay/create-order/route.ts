import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";
import { calculateCouponDiscount } from "@/lib/coupons";

// Creates a Razorpay order for the authenticated user's cart and also creates an internal Order.
// Client should then complete payment on Razorpay Checkout and call /verify.

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = (await request.json().catch(() => ({}))) as {
      shippingAddress: unknown;
      paymentMethod?: string;
      couponCode?: string;
    };

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const res = await calculateCouponDiscount({
        couponCode: body.couponCode,
        subtotal,
      });
      if (!res.ok) {
        return NextResponse.json({ error: res.reason }, { status: 400 });
      }
      discount = res.discount;
      couponCode = res.couponCode;
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = 0; // No tax
    
    // No shipping charges - delivery charges will be discussed with owner at time of delivery
    const shippingCost = 0;
    
    const total = taxableAmount + tax + shippingCost;

    const orderNumber = `ORD${Date.now()}`;

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          subtotal,
          discount,
          couponCode,
          tax,
          shippingCost,
          total,
          paymentMethod: body.paymentMethod || "RAZORPAY",
          paymentStatus: "PENDING",
          paymentProvider: "razorpay",
          shippingAddress: body.shippingAddress ?? {},
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Reserve coupon usage (simple counter increment; real systems would do per-user redemptions)
      if (couponCode) {
        await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
      }

      // Clear cart after order creation (you can change to clear after payment if you prefer)
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });

    const razorpay = getRazorpayClient();

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(created.total * 100), // paise
      currency: "INR",
      receipt: created.orderNumber,
      notes: {
        internalOrderId: created.id,
      },
    });

    await prisma.order.update({
      where: { id: created.id },
      data: {
        paymentOrderId: rpOrder.id,
      },
    });

    return NextResponse.json({
      order: { id: created.id, orderNumber: created.orderNumber, total: created.total },
      razorpayOrder: {
        id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
