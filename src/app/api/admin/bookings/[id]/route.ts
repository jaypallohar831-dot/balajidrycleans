/**
 * PATCH /api/admin/bookings/[id]
 * ──────────────────────────────
 * Update booking status or notes and append to booking_status_history.
 */

import { NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  const { id } = await params;
  if (!id) {
    return fail("VALIDATION_ERROR", "Booking ID zaroori hai.", 422);
  }

  const body = await request.json();
  const { status, notes, adminNote } = body;

  const validStatuses = [
    "pending",
    "confirmed",
    "picked_up",
    "delivered",
    "cancelled",
  ];

  if (status && !validStatuses.includes(status)) {
    return fail("VALIDATION_ERROR", `Amanay status: ${status}`, 422);
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    return ok({
      id,
      status: status || "confirmed",
      notes: notes || null,
      message: "Booking status update ho gaya!",
    });
  }

  try {
    const db = getServiceClient();

    // 1. Fetch current booking to get from_status
    const { data: existing, error: fetchErr } = await db
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return fail("NOT_FOUND", "Booking nahi mili.", 404);
    }

    const fromStatus = existing.status;

    // 2. Update booking
    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error: updateErr } = await db
      .from("bookings")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("[UpdateBooking:ERROR]", updateErr.message);
      return fail("SERVER_ERROR", updateErr.message, 500);
    }

    // 3. Insert status history audit log if status changed
    if (status && status !== fromStatus) {
      await db.from("booking_status_history").insert({
        booking_id: id,
        from_status: fromStatus,
        to_status: status,
        note: adminNote || notes || null,
        changed_by: admin.email,
      });
    }

    return ok(updated);
  } catch (err: any) {
    console.error("[UpdateBooking:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Booking update karne mein samasya aayi.", 500);
  }
}

/**
 * GET /api/admin/bookings/[id]
 * ────────────────────────────
 * Returns single booking with full status history.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  const { id } = await params;
  if (!id) return fail("VALIDATION_ERROR", "ID zaroori hai.", 422);

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    return ok({
      id,
      booking_code: "BDC-5926",
      name: "Aakash Mehta",
      phone: "+919829012345",
      service: "suit-blazer-sherwani",
      pickup_slot: "shaam",
      pickup_date: "2026-10-22",
      address: "Plot 12, Behind Maheshwari Bhawan, RK Colony, Bhilwara",
      status: "pending",
      notes: "Urgent wedding wear",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      history: [
        {
          id: "hist-1",
          from_status: null,
          to_status: "pending",
          note: "Website se nayi booking",
          changed_by: "system",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ],
    });
  }

  try {
    const db = getServiceClient();
    const { data: booking, error: bErr } = await db
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (bErr || !booking) {
      return fail("NOT_FOUND", "Booking nahi mili.", 404);
    }

    const { data: history } = await db
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", id)
      .order("created_at", { ascending: false });

    return ok({
      ...booking,
      history: history || [],
    });
  } catch (err: any) {
    console.error("[GetBooking:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Booking fetch karne mein samasya aayi.", 500);
  }
}
