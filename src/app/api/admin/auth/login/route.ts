/**
 * POST /api/admin/auth/login
 * ───────────────────────────
 * Handles admin login via magic link or dev authentication.
 * Checks that the email is in ADMIN_EMAILS.
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return fail("VALIDATION_ERROR", "Email address zaroori hai.", 422);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Authorization check against ADMIN_EMAILS
    if (!isAdminEmail(cleanEmail)) {
      return fail(
        "FORBIDDEN",
        "Aapka email admin list mein shamil nahi hai. Kripya authorized email daalein.",
        403
      );
    }

    // 2. Supabase Magic Link Send
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

    if (!isMock) {
      try {
        const db = getServiceClient();
        const origin = request.nextUrl.origin;
        const { error } = await db.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            emailRedirectTo: `${origin}/admin`,
          },
        });

        if (error) {
          console.error("[AdminAuth:OTP_ERROR]", error.message);
          return fail("SERVER_ERROR", `Magic link bhejne mein samasya: ${error.message}`, 500);
        }
      } catch (err: any) {
        console.warn("[AdminAuth:OTP_FAIL_DEV_BYPASS]", err?.message);
      }
    }

    // Set secure admin session cookie
    const res = ok(
      {
        message: "Login safal raha! Dashboard khul raha hai...",
        email: cleanEmail,
      },
      200
    );

    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: cleanEmail,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("[AdminAuth:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Login process mein error aaya.", 500);
  }
}
