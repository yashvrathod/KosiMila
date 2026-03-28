// User API: Cancel an order
// Users can only cancel orders with PENDING or CONFIRMED status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    const { id } = await params;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Only allow cancellation of PENDING or CONFIRMED orders
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json(
        {
          error: "Cannot cancel order with status: " + order.status,
          canCancel: false,
        },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Restore stock for cancelled products
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Restore coupon usage if coupon was used
    if (order.couponCode) {
      await prisma.coupon.update({
        where: { code: order.couponCode },
        data: {
          usedCount: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Order cancellation error:", error);

    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
