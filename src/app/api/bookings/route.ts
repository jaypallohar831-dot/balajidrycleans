/**
 * POST /api/bookings
 * ───────────────────
 * Accepts a pickup-booking submission, validates, checks turnstile & rate limit,
 * saves to Supabase `bookings` table, returns the booking_code, and fires
 * background notifications (Email + WhatsApp).
 */

import { NextRequest } from "next/server";
import { bookingSchema, formatZodErrors } from "@/lib/validators";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { ok, ERRORS } from "@/lib/response";
import { getServiceClient } from "@/lib/supabase/server";
import { notifyNewBooking, scheduleBackgroundTask } from "@/lib/notify";

export async function POST(request: NextRequest) {
  try {
    // ── Parse body ──────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return ERRORS.VALIDATION("Request body sahi JSON hona chahiye.");
    }

    // ── Validate with Zod ───────────────────────────────
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return ERRORS.VALIDATION(formatZodErrors(result.error));
    }

    const {
      name,
      phone,
      email,
      service,
      pickupSlot,
      pickupDate,
      address,
      notes,
      turnstileToken,
      honeypot,
    } = result.data;

    // ── Honeypot check (reject bot, return 200 silently) ──
    if (honeypot && honeypot.trim().length > 0) {
      return ok({ received: true });
    }

    // ── Rate limit (5 per 10 mins by IP) ────────────────
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, "bookings");
    if (!allowed) {
      return ERRORS.RATE_LIMIT();
    }

    // ── Turnstile verification ──────────────────────────
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      return ERRORS.TURNSTILE();
    }

    // ── Save to Supabase ────────────────────────────────
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT") ||
      process.env.NODE_ENV === "test";

    let bookingCode: string;
    let bookingId: string;

    if (isMock) {
      bookingCode = `BDC-${Math.floor(1000 + Math.random() * 9000)}`;
      bookingId = "bk_" + Math.random().toString(36).substring(2, 10);
    } else {
      const db = getServiceClient();
      const { data, error } = await db
        .from("bookings")
        .insert({
          name,
          phone,
          service,
          pickup_slot: pickupSlot,
          pickup_date: pickupDate,
          address,
          notes: notes || null,
          status: "pending",
        })
        .select("id, booking_code, created_at")
        .single();

      if (error) {
        console.error("Booking insert error:", error.message);
        return ERRORS.SERVER();
      }

      bookingId = data.id;
      bookingCode = data.booking_code;
    }

    // ── Schedule background notifications (never slows the response) ──
    scheduleBackgroundTask(async () => {
      await notifyNewBooking({
        bookingCode,
        name,
        phone,
        service,
        pickupSlot,
        pickupDate,
        address,
        notes,
        email,
      });
    });

    return ok(
      {
        id: bookingId,
        bookingCode,
        message: `Booking ${bookingCode} confirm ho gayi! Hum jaldi pickup karenge.`,
      },
      201
    );
  } catch (err) {
    console.error("Booking route error:", err);
    return ERRORS.SERVER();
  }
}
