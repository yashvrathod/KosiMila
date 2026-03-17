// Simple test endpoint to check Vercel environment
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  console.log("=== TEST ENDPOINT CALLED ===");
  
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.NEXTAUTH_SECRET,
    dbUrlPreview: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 30) + "..." : 
      "NOT SET",
  };

  console.log("Environment checks:", checks);

  // Test database connection
  let dbTest = {
    connected: false,
    error: null as string | null,
    userCount: 0,
  };

  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    const count = await prisma.user.count();
    dbTest.connected = true;
    dbTest.userCount = count;
    console.log("Database test successful, user count:", count);
  } catch (error) {
    dbTest.error = error instanceof Error ? error.message : String(error);
    console.error("Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json({
    status: "ok",
    checks,
    database: dbTest,
  });
}
