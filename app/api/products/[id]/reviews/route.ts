import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { productId: id } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Auth required to review
    try {
      getUserId(request);
    } catch (authError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = (await request.json()) as {
      userName: string;
      rating: number;
      comment: string;
    };

    const rating = Number(body.rating);
    if (!body.userName || !body.comment || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userName: body.userName,
        rating: Math.round(rating),
        comment: body.comment,
      },
    });

    // Update product aggregates
    const agg = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id },
      data: {
        ratings: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
