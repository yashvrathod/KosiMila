// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { productId, quantity = 1 } = await request.json();

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingItem) {
      const cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      return NextResponse.json({ cartItem });
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: true },
    });

    return NextResponse.json({ cartItem }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Not authenticated") ||
        error.message.includes("Invalid token") ||
        error.message.includes("Forbidden"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { productId, quantity } = await request.json();

    const cartItem = await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json({ cartItem });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}
