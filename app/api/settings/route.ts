import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public settings endpoint: exposes only non-sensitive fields needed by client
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: "My Store",
          currency: "INR",
          taxRate: 0,
        },
      });
    }

    // Only expose selected fields
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription ?? null,
      contactPhone: settings.contactPhone ?? null,
      currency: settings.currency,
      taxRate: settings.taxRate,
      // Expect paymentMethods like { upi: { vpa: string, name?: string } }
      paymentMethods: settings.paymentMethods ?? null,
    } as const;

    return NextResponse.json({ settings: publicSettings });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
