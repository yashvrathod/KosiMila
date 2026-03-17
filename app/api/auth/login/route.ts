// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  console.log("=== LOGIN REQUEST STARTED ===");
  console.log("Environment check:", {
    hasDbUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
  
  try {
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed successfully");
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;
    console.log("Email received:", email ? "present" : "missing");
    console.log("Password received:", password ? "present" : "missing");

    // Validate input
    if (!email || !password) {
      console.log("Validation failed: missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      console.log("Validation failed: wrong types");
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    // Trim and validate email format
    const trimmedEmail = email.trim().toLowerCase();
    console.log("Trimmed email:", trimmedEmail);
    
    if (!trimmedEmail || trimmedEmail.length === 0) {
      console.log("Validation failed: empty email");
      return NextResponse.json(
        { error: "Email cannot be empty" },
        { status: 400 }
      );
    }

    console.log("Starting database lookup...");
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
      console.log("Database lookup result:", user ? "User found" : "User not found");
    } catch (dbError) {
      console.error("DATABASE ERROR:", {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
        name: dbError instanceof Error ? dbError.name : undefined,
        email: trimmedEmail,
      });
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 503 }
      );
    }

    if (!user) {
      console.log("User not found - returning 401");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Starting password verification...");
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password verification result:", isValidPassword ? "Valid" : "Invalid");
    } catch (bcryptError) {
      console.error("BCRYPT ERROR:", {
        message: bcryptError instanceof Error ? bcryptError.message : String(bcryptError),
        stack: bcryptError instanceof Error ? bcryptError.stack : undefined,
        name: bcryptError instanceof Error ? bcryptError.name : undefined,
      });
      return NextResponse.json(
        { error: "Password verification error. Please try again." },
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      console.log("Invalid password - returning 401");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Starting JWT token generation...");
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: "7d" }
      );
      console.log("JWT token generated successfully");
    } catch (jwtError) {
      console.error("JWT ERROR:", {
        message: jwtError instanceof Error ? jwtError.message : String(jwtError),
        stack: jwtError instanceof Error ? jwtError.stack : undefined,
        name: jwtError instanceof Error ? jwtError.name : undefined,
      });
      return NextResponse.json(
        { error: "Token generation error. Please try again." },
        { status: 500 }
      );
    }

    console.log("Creating response...");
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    console.log("Setting cookie...");
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("=== LOGIN SUCCESS ===");
    return response;
  } catch (error) {
    // Detailed error logging for production debugging
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      toString: String(error),
    });
    console.error("Full error object:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
