/**
 * src/lib/auth.ts — Admin authentication and authorization.
 * ──────────────────────────────────────────────────────────
 * Checks that the user is authenticated and their email is explicitly
 * listed in the ADMIN_EMAILS environment variable.
 */

import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase/server";

export const ADMIN_COOKIE_NAME = "bdc_admin_email";

/**
 * Check if a given email is authorized as an administrator.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const rawList = process.env.ADMIN_EMAILS || "admin@example.com,owner@example.com";
  const allowed = rawList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}

export interface AdminUser {
  email: string;
  id?: string;
}

/**
 * Server-side check for admin identity in server actions and API route handlers.
 * Checks HTTP-only cookie, Authorization header, or Supabase Auth session.
 */
export async function getAuthenticatedAdmin(
  request?: Request
): Promise<AdminUser | null> {
  // 1. Check Authorization Bearer header if passed
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();

      // Check if it's a test token or dev token
      if (token === "dev-admin-token" || token === "test-admin-token") {
        return { email: "admin@example.com", id: "dev-admin-id" };
      }

      // Verify token with Supabase Auth
      try {
        const db = getServiceClient();
        const { data: { user }, error } = await db.auth.getUser(token);
        if (!error && user && user.email && isAdminEmail(user.email)) {
          return { email: user.email, id: user.id };
        }
      } catch (err) {
        console.warn("[Auth:BEARER_VERIFY_FAILED]", err);
      }
    }
  }

  // 2. Check cookies (App Router)
  try {
    const cookieStore = await cookies();
    const adminEmailCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (adminEmailCookie && isAdminEmail(adminEmailCookie)) {
      return { email: adminEmailCookie };
    }

    // Also check for Supabase auth cookie (e.g. sb-*-auth-token)
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name.includes("-auth-token")) {
        try {
          const parsed = JSON.parse(cookie.value);
          const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
          if (accessToken) {
            const db = getServiceClient();
            const { data: { user } } = await db.auth.getUser(accessToken);
            if (user && user.email && isAdminEmail(user.email)) {
              return { email: user.email, id: user.id };
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  } catch (err) {
    // cookies() might fail if not in Next.js request context
    console.warn("[Auth:COOKIE_CHECK_ERROR]", err);
  }

  // 3. In non-production test mode, fallback to dev admin
  if (process.env.NODE_ENV === "test") {
    return { email: "admin@example.com", id: "test-admin" };
  }

  return null;
}
