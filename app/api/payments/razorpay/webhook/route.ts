import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// Razorpay webhooks: https://razorpay.com/docs/webhooks/
// Configure webhook secret in env: RAZORPAY_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Need raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    type RazorpayWebhookPayload = {
      payment?: {
        entity?: {
          order_id?: string;
          id?: string;
        };
      };
    };

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: RazorpayWebhookPayload;
    };

    // Handle common payment events
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId) {
        await prisma.order.updateMany({
          where: { paymentOrderId: orderId, paymentProvider: "razorpay" },
          data: {
            paymentStatus: "COMPLETED",
            status: "CONFIRMED",
            paymentId: paymentId ?? undefined,
          },
        });
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;

      if (orderId) {
        await prisma.order.updateMany({
          where: { paymentOrderId: orderId, paymentProvider: "razorpay" },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
