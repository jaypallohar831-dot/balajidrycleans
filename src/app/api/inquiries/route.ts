/**
 * POST /api/inquiries
 * ────────────────────
 * Accepts a contact-form submission, validates, checks turnstile & rate limit,
 * saves to Supabase `inquiries` table, and fires background notifications.
 */

import { NextRequest } from "next/server";
import { inquirySchema, formatZodErrors } from "@/lib/validators";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/rateLimit";
import { ok, ERRORS } from "@/lib/response";
import { getServiceClient } from "@/lib/supabase/server";
import { notifyNewInquiry, scheduleBackgroundTask } from "@/lib/notify";

export async function POST(request: NextRequest) {
  try {
    // ── Parse body ──────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return ERRORS.VALIDATION("Request body must be valid JSON.");
    }

    // ── Validate with Zod ───────────────────────────────
    const result = inquirySchema.safeParse(body);
    if (!result.success) {
      return ERRORS.VALIDATION(formatZodErrors(result.error));
    }

    const { name, phone, message, email, turnstileToken, honeypot } = result.data;

    // ── Honeypot check (reject bot, return 200 silently) ──
    if (honeypot && honeypot.trim().length > 0) {
      return ok({ received: true });
    }

    // ── Rate limit (5 per 10 mins by IP) ────────────────
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, "inquiries");
    if (!allowed) {
      return ERRORS.RATE_LIMIT();
    }

    // ── Turnstile verification ──────────────────────────
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      return ERRORS.TURNSTILE();
    }

    // ── Schedule background notifications ───────────────
    scheduleBackgroundTask(async () => {
      await notifyNewInquiry({
        name,
        phone,
        message,
        email,
      });
    });

    // ── Save to Supabase ────────────────────────────────
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT") ||
      process.env.NODE_ENV === "test";

    if (isMock) {
      return ok(
        {
          id: "inq_" + Math.random().toString(36).substring(2, 10),
          message: "Inquiry received! We will contact you shortly.",
        },
        201
      );
    }

    const db = getServiceClient();
    const { data, error } = await db
      .from("inquiries")
      .insert({
        name,
        phone,
        message: message || null,
        source: "website",
        status: "new",
        ip_hash: hashIp(ip),
        user_agent: request.headers.get("user-agent") || null,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Inquiry insert error:", error.message);
      return ERRORS.SERVER();
    }

    return ok({ id: data.id, message: "Inquiry received! We will contact you shortly." }, 201);
  } catch (err) {
    console.error("Inquiry route error:", err);
    return ERRORS.SERVER();
  }
}
