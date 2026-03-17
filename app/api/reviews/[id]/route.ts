import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// Note: Reviews in this schema are not linked to a userId; so we only require auth.
// In a real system you'd also verify ownership.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    try {
      getUserId(request);
    } catch (authError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = (await request.json()) as {
      userName?: string;
      rating?: number;
      comment?: string;
      verified?: boolean;
    };

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const rating = body.rating === undefined ? undefined : Number(body.rating);
    if (rating !== undefined && (!Number.isFinite(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        userName: body.userName,
        rating: rating !== undefined ? Math.round(rating) : undefined,
        comment: body.comment,
        verified: body.verified,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        ratings: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    try {
      getUserId(request);
    } catch (authError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    const agg = await prisma.review.aggregate({
      where: { productId: existing.productId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        ratings: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
