/**
 * GET /api/admin/export
 * ─────────────────────
 * Exports bookings or inquiries as a downloadable CSV for a selected date range.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { fail } from "@/lib/response";

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "bookings";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  let csvContent = "";
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `balaji-${type}-${dateFrom || "all"}-to-${dateTo || timestamp}.csv`;

  if (type === "inquiries") {
    const headers = ["ID", "Created At", "Name", "Phone", "Status", "Message", "Source"];
    let rows: any[] = [];

    if (isMock) {
      rows = [
        {
          id: "mock-i-1",
          created_at: new Date().toISOString(),
          name: "Priya Sharma",
          phone: "+919876543210",
          status: "new",
          message: "Silk saree inquiry",
          source: "website",
        },
      ];
    } else {
      const db = getServiceClient();
      let query = db.from("inquiries").select("*");
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);
      const { data } = await query.order("created_at", { ascending: false });
      rows = data || [];
    }

    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          escapeCsvCell(r.id),
          escapeCsvCell(r.created_at),
          escapeCsvCell(r.name),
          escapeCsvCell(r.phone),
          escapeCsvCell(r.status),
          escapeCsvCell(r.message),
          escapeCsvCell(r.source),
        ].join(",")
      ),
    ];
    csvContent = lines.join("\n");
  } else {
    // Bookings export
    const headers = [
      "Booking Code",
      "Created At",
      "Customer Name",
      "Phone",
      "Service",
      "Pickup Slot",
      "Pickup Date",
      "Address",
      "Status",
      "Notes",
    ];

    let rows: any[] = [];

    if (isMock) {
      rows = [
        {
          booking_code: "BDC-5926",
          created_at: new Date().toISOString(),
          name: "Aakash Mehta",
          phone: "+919829012345",
          service: "suit-blazer-sherwani",
          pickup_slot: "shaam",
          pickup_date: "2026-10-22",
          address: "Plot 12, RK Colony, Bhilwara",
          status: "pending",
          notes: "Urgent wedding wear",
        },
      ];
    } else {
      const db = getServiceClient();
      let query = db.from("bookings").select("*");
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);
      const { data } = await query.order("created_at", { ascending: false });
      rows = data || [];
    }

    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          escapeCsvCell(r.booking_code),
          escapeCsvCell(r.created_at),
          escapeCsvCell(r.name),
          escapeCsvCell(r.phone),
          escapeCsvCell(r.service),
          escapeCsvCell(r.pickup_slot),
          escapeCsvCell(r.pickup_date),
          escapeCsvCell(r.address),
          escapeCsvCell(r.status),
          escapeCsvCell(r.notes),
        ].join(",")
      ),
    ];
    csvContent = lines.join("\n");
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
