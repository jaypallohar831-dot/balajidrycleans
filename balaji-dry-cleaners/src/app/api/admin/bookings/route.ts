/**
 * GET /api/admin/bookings
 * ───────────────────────
 * Search, filter, and paginate bookings with server-side admin check.
 */

import { NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const dateFrom = searchParams.get("dateFrom")?.trim() || "";
  const dateTo = searchParams.get("dateTo")?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    const mockBookings = [
      {
        id: "mock-b-1",
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
      },
      {
        id: "mock-b-2",
        booking_code: "BDC-4421",
        name: "Vikram Rathore",
        phone: "+919829098290",
        service: "rajai-kambal-parde",
        pickup_slot: "subah",
        pickupDate: "2026-10-21",
        pickup_date: "2026-10-21",
        address: "House 24, Patel Nagar, Bhilwara",
        status: "picked_up",
        notes: null,
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: "mock-b-3",
        booking_code: "BDC-3310",
        name: "Pooja Verma",
        phone: "+919876543210",
        service: "saree-lehenga-ghagra",
        pickup_slot: "dopahar",
        pickup_date: "2026-10-20",
        address: "45, Subhash Nagar, Bhilwara",
        status: "delivered",
        notes: "Gota patti heavy border",
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ];

    let filtered = mockBookings;
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(lower) ||
          b.phone.includes(lower) ||
          b.booking_code.toLowerCase().includes(lower)
      );
    }
    if (status && status !== "all") {
      filtered = filtered.filter((b) => b.status === status);
    }

    return ok({
      bookings: filtered.slice(offset, offset + limit),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    });
  }

  try {
    const db = getServiceClient();
    let query = db
      .from("bookings")
      .select("*", { count: "exact" });

    // Filter by search query (name, phone, booking_code)
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,booking_code.ilike.%${q}%`
      );
    }

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status as any);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte("pickup_date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("pickup_date", dateTo);
    }

    // Sort and paginate
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[AdminBookings:DB_ERROR]", error.message);
      return fail("SERVER_ERROR", error.message, 500);
    }

    return ok({
      bookings: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    });
  } catch (err: any) {
    console.error("[AdminBookings:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Bookings fetch karne mein samasya aayi.", 500);
  }
}
