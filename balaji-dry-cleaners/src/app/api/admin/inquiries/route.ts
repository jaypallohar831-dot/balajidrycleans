/**
 * GET /api/admin/inquiries
 * ────────────────────────
 * Search, filter by status (new/contacted/closed), and paginate inquiries.
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
    const mockInquiries = [
      {
        id: "mock-i-1",
        name: "Priya Sharma",
        phone: "+919876543210",
        message: "Silk saree par haldi ka ziddi daag hai, safely saaf ho jayega kya?",
        status: "new",
        source: "website",
        created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        id: "mock-i-2",
        name: "Ramesh Chand",
        phone: "+919829011223",
        message: "Bhilwara bypass par pickup service available hai kya?",
        status: "contacted",
        source: "website",
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: "mock-i-3",
        name: "Kavita Lodha",
        phone: "+919829033445",
        message: "Wedding sherwani steam press charges batayein.",
        status: "closed",
        source: "website",
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ];

    let filtered = mockInquiries;
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.phone.includes(lower) ||
          (i.message && i.message.toLowerCase().includes(lower))
      );
    }
    if (status && status !== "all") {
      filtered = filtered.filter((i) => i.status === status);
    }

    return ok({
      inquiries: filtered.slice(offset, offset + limit),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    });
  }

  try {
    const db = getServiceClient();
    let query = db
      .from("inquiries")
      .select("*", { count: "exact" });

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,message.ilike.%${q}%`
      );
    }

    if (status && status !== "all") {
      query = query.eq("status", status as any);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[AdminInquiries:DB_ERROR]", error.message);
      return fail("SERVER_ERROR", error.message, 500);
    }

    return ok({
      inquiries: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    });
  } catch (err: any) {
    console.error("[AdminInquiries:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Inquiries fetch karne mein samasya aayi.", 500);
  }
}
