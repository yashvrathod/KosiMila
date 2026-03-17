// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  // Ensure we delete for the same path we set
  response.cookies.set("token", "", { path: "/", maxAge: 0 });
  return response;
}
