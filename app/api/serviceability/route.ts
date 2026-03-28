import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
  }

  try {
    const nonServiceable = await prisma.nonServiceableArea.findUnique({
      where: { pincode },
    });

    if (nonServiceable) {
      return NextResponse.json({
        serviceable: false,
        reason: nonServiceable.reason || "We are not delivering to this area yet.",
      });
    }

    return NextResponse.json({ serviceable: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check serviceability" }, { status: 500 });
  }
}
