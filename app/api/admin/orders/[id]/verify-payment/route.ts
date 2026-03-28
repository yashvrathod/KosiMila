// Admin API: Verify payment for an order
// This clears the user's cart and updates order status to CONFIRMED

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const adminPayload = requireAdmin(request);

    const { id } = await params;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (order.paymentVerified) {
      return NextResponse.json(
        { error: "Payment already verified" },
        { status: 400 }
      );
    }

    // Only verify orders with PENDING or CONFIRMED status
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Cannot verify payment for order with status: " + order.status },
        { status: 400 }
      );
    }

    // Update order with payment verification
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentVerified: true,
        paymentVerifiedAt: new Date(),
        paymentVerifiedBy: adminPayload.userId,
        paymentStatus: "COMPLETED",
        status: "CONFIRMED",
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Clear user's cart AFTER payment is verified
    await prisma.cartItem.deleteMany({
      where: { userId: order.userId },
    });

    // Deduct stock for ordered products
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Payment verified successfully. Cart cleared and stock updated.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
