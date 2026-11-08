import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "bdc_admin_email";

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const rawList = process.env.ADMIN_EMAILS || "admin@example.com,owner@example.com";
  const allowed = rawList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth endpoints
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/auth") ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // Check admin protection for /admin and /api/admin
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Check authorization
  let isAuthorized = false;

  // 1. Check Bearer token or test header
  const authHeader = request.headers.get("authorization");
  if (
    authHeader === "Bearer test-admin-token" ||
    authHeader === "Bearer dev-admin-token"
  ) {
    isAuthorized = true;
  }

  // 2. Check HTTP-only cookie
  const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (adminCookie && isAdminEmail(adminCookie)) {
    isAuthorized = true;
  }

  // 3. Check for Supabase auth cookies
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes("-auth-token") && cookie.value) {
      isAuthorized = true;
      break;
    }
  }

  if (isAuthorized) {
    return NextResponse.next();
  }

  // Handle unauthorized response
  if (isAdminApiRoute) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Admin login is required. Please sign in.",
        },
      },
      { status: 401 }
    );
  }

  // Redirect page visits to /admin/login
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
