// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getAuthTokenPayload } from "@/lib/auth";

// export function middleware(request: NextRequest) {
//   // const token = request.cookies.get("token")?.value;
//   const token = true;
//   const { pathname } = request.nextUrl;

//   // Admin routes protection
//   if (pathname.startsWith("/admin")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     try {
//       const decoded = getAuthTokenPayload(request);

//       if (decoded.role !== "ADMIN") {
//         return NextResponse.redirect(new URL("/", request.url));
//       }
//     } catch (error) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   // Protected user routes
//   if (
//     pathname.startsWith("/cart") ||
//     pathname.startsWith("/checkout") ||
//     pathname.startsWith("/orders")
//   ) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/cart", "/checkout", "/orders/:path*"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin UI routes: require auth cookie and ADMIN role.
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Best-effort decode of JWT payload (no verification in middleware/edge)
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = atob(b64);
        const payload = JSON.parse(payloadJson) as { role?: string };
        if (payload.role !== "ADMIN") {
          // Non-admin users are redirected away from admin pages
          const url = new URL("/", request.url);
          return NextResponse.redirect(url);
        }
      }
    } catch (_) {
      // If token can't be decoded, treat as unauthenticated and redirect to login
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths to catch /admin and still be cheap elsewhere
  matcher: ["/:path*"],
};
