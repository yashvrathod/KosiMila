import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// Middleware to check if user is admin
async function isAdmin(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const areas = await prisma.nonServiceableArea.findMany({
      orderBy: { pincode: "asc" },
    });
    return NextResponse.json({ areas });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch non-serviceable areas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pincode, reason } = body;

    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    const area = await prisma.nonServiceableArea.upsert({
      where: { pincode },
      update: { reason },
      create: { pincode, reason },
    });

    return NextResponse.json({ area });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update non-serviceable area" }, { status: 500 });
  }
}
