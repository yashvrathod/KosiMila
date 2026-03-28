// Generate QR code payment link - simple UPI string based
// No external API calls needed, just generates UPI string
// User can scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

interface GenerateQRRequest {
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const body = (await request.json()) as GenerateQRRequest;
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Fetch order to verify it exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to requesting user
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Only generate QR for PENDING orders
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "QR code only for pending orders" },
        { status: 400 }
      );
    }

    // Generate UPI string in standard format
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tr=TXNREFID&tn=DESCRIPTION
    
    const upiId = process.env.UPI_ID || "merchant@upi"; // Set your UPI ID in .env
    const merchantName = process.env.MERCHANT_NAME || "Kosimila";
    const amount = order.total;
    const transactionRef = order.orderNumber; // Use order number as reference
    const description = `Payment for order ${order.orderNumber}`;

    // UPI string - spaces and special chars need to be URL encoded
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      merchantName
    )}&am=${amount}&tr=${transactionRef}&tn=${encodeURIComponent(description)}`;

    // Also provide plain UPI with just essentials for better compatibility
    const simpleUPI = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      merchantName
    )}&am=${amount}`;

    return NextResponse.json({
      orderId,
      orderNumber: order.orderNumber,
      amount: order.total,
      upiString, // Full UPI string with metadata
      simpleUPI, // Simple UPI string (more compatible)
      message: `Scan with any UPI app to pay ₹${amount}`,
      //@ts-ignore
      qrCodeData: {
        text: upiString,
        size: 300,
        margin: 2,
        // Client should use a QR code library like 'qrcode' npm package
        // to convert this text to actual QR image
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);

    if (
      error instanceof Error &&
      (error.message === "Not authenticated" ||
        error.message === "Invalid token")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
