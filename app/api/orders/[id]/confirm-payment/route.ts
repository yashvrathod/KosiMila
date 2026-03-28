// Confirm payment for an order - UNIFIED ENDPOINT
// Used for both manual COD verification and QR code payment confirmation
// This replaces the old verify-payment endpoint

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, getUserId } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Either admin or user who placed the order can confirm
    let userId: string;
    let isAdmin = false;

    try {
      const adminPayload = requireAdmin(request);
      userId = adminPayload.userId;
      isAdmin = true;
    } catch {
      // Not admin, try user
      userId = await getUserId(request);
    }

    // Fetch order with all details
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

    // Authorization check
    if (!isAdmin && order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (order.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "Order already confirmed" },
        { status: 400 }
      );
    }

    // Only allow confirmation for PENDING orders
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot confirm payment for order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // CRITICAL: Use transaction to ensure atomicity
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "COMPLETED",
          paymentVerified: true,
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: isAdmin ? userId : undefined,
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // Validate and deduct stock for each item
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // Check if sufficient stock available
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart (ONLY after successful stock deduction)
      await tx.cartItem.deleteMany({
        where: { userId: order.userId },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Payment confirmed. Cart cleared and stock updated.",
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);

    if (error instanceof Error) {
      // Stock validation errors
      if (error.message.includes("Insufficient stock")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Authorization errors
      if (error.message === "Forbidden") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (error.message === "Not authenticated") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
