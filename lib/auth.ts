import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function getJwtSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Fail closed in production; in dev allow easier setup.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing NEXTAUTH_SECRET env var");
    }
    return "dev-secret";
  }
  return secret;
}

export function getAuthTokenPayload(request: NextRequest): AuthTokenPayload {
  const token = request.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, getJwtSecret()) as Partial<AuthTokenPayload>;
  if (!decoded.userId || !decoded.email || !decoded.role) {
    throw new Error("Invalid token");
  }
  return decoded as AuthTokenPayload;
}

export function getUserId(request: NextRequest): string {
  return getAuthTokenPayload(request).userId;
}

export function requireAdmin(request: NextRequest): AuthTokenPayload {
  const payload = getAuthTokenPayload(request);
  if (payload.role !== "ADMIN") throw new Error("Forbidden");
  return payload;
}
