import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    // Basic pagination (optional)
    const { searchParams } = new URL(request.url);
    const take = Math.min(Number(searchParams.get("take") ?? 50), 100);
    const skip = Number(searchParams.get("skip") ?? 0);

    const [rawItems, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip: Number.isFinite(skip) ? skip : 0,
        take: Number.isFinite(take) ? take : 50,
        // Select only fields guaranteed to exist even if a migration hasn't run yet
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.contactMessage.count(),
    ]);

    // Backward-compatible mapping in case `read` column hasn't been migrated yet
    const items = rawItems.map((m: any) => ({ ...m, read: (m as any).read ?? false }));

    return NextResponse.json({ items, total });
  } catch (e: any) {
    const msg = e?.message || "Failed to fetch messages";
    const status = msg === "Not authenticated" || msg === "Invalid token" ? 401 : msg === "Forbidden" ? 403 : 500;
    if (process.env.NODE_ENV !== "production") console.error("GET /api/admin/messages error:", e);
    return NextResponse.json({ error: msg }, { status });
  }
}
