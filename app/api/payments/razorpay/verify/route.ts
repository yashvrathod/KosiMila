import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const body = (await request.json()) as {
      internalOrderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    const order = await prisma.order.findFirst({
      where: { id: body.internalOrderId, userId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    if (expected !== body.razorpay_signature) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
        paymentProvider: "razorpay",
        paymentOrderId: body.razorpay_order_id,
        paymentId: body.razorpay_payment_id,
        paymentSignature: body.razorpay_signature,
      },
    });

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
