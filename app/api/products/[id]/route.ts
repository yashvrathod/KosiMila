// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();
    const { variants, ...rest } = data;
    let updateData = { ...rest };

    if (data.name && typeof data.name === 'string') {
      const trimmedName = data.name.trim();
      const newSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const existingProduct = await prisma.product.findUnique({ where: { slug: newSlug } });
      if (existingProduct && existingProduct.id !== id) {
        return NextResponse.json({ error: `Conflicting name: "${existingProduct.name}"` }, { status: 409 });
      }
      updateData.name = trimmedName;
      updateData.slug = newSlug;
    }

    const product = await prisma.$transaction(async (tx) => {
      if (variants) {
        // Simple approach: delete all existing and recreate
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              weight: v.weight,
              price: parseFloat(v.price),
              comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null,
              stock: parseInt(v.stock || "0"),
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: { variants: true }
      });
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
