/**
 * GET /api/admin/stats
 * ────────────────────
 * Returns dashboard metrics & recent activity feed.
 * Protected by getAuthenticatedAdmin().
 */

import { NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";

export async function GET(request: NextRequest) {
  // Re-check admin on the server
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    return ok({
      metrics: {
        newInquiries: 3,
        newBookingsToday: 5,
        pendingPickups: 2,
        readyForDelivery: 4,
      },
      recentActivity: [
        {
          id: "act-1",
          type: "booking",
          title: "Nayi Booking: BDC-5926",
          subtitle: "Aakash Mehta · Suit / Blazer / Sherwani",
          status: "pending",
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "act-2",
          type: "inquiry",
          title: "Nayi Inquiry",
          subtitle: "Priya Sharma · Lehenga cleaning inquiry",
          status: "new",
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
        {
          id: "act-3",
          type: "booking",
          title: "Pickup Complete: BDC-4421",
          subtitle: "Vikram Rathore · Rajai / Kambal",
          status: "picked_up",
          created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        },
      ],
    });
  }

  try {
    const db = getServiceClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      { count: newInquiries },
      { count: newBookingsToday },
      { count: pendingPickups },
      { count: readyForDelivery },
      { data: recentBookings },
      { data: recentInquiries },
    ] = await Promise.all([
      db.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      db.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      db.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("bookings").select("*", { count: "exact", head: true }).eq("status", "picked_up"),
      db.from("bookings").select("id, booking_code, name, service, status, created_at").order("created_at", { ascending: false }).limit(6),
      db.from("inquiries").select("id, name, phone, message, status, created_at").order("created_at", { ascending: false }).limit(6),
    ]);

    const activity = [
      ...(recentBookings || []).map((b) => ({
        id: b.id,
        type: "booking" as const,
        title: `Booking: ${b.booking_code}`,
        subtitle: `${b.name} · ${b.service}`,
        status: b.status,
        created_at: b.created_at,
      })),
      ...(recentInquiries || []).map((i) => ({
        id: i.id,
        type: "inquiry" as const,
        title: `Inquiry: ${i.name}`,
        subtitle: `${i.phone} · ${i.message || "No message"}`,
        status: i.status,
        created_at: i.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return ok({
      metrics: {
        newInquiries: newInquiries || 0,
        newBookingsToday: newBookingsToday || 0,
        pendingPickups: pendingPickups || 0,
        readyForDelivery: readyForDelivery || 0,
      },
      recentActivity: activity,
    });
  } catch (err: any) {
    console.error("[AdminStats:ERROR]", err);
    return fail("SERVER_ERROR", "Dashboard stats fetch karne mein samasya.", 500);
  }
}
