import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    const body = (await request.json()) as {
      title: string;
      subtitle?: string;
      image: string;
      link?: string;
      active?: boolean;
      order?: number;
    };

    if (!body?.title || !body?.image) {
      return NextResponse.json({ error: "Invalid banner" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        image: body.image,
        link: body.link,
        active: body.active ?? true,
        order: body.order ?? 0,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
