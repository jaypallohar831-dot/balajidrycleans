/**
 * PATCH /api/admin/inquiries/[id]
 * ───────────────────────────────
 * Update inquiry status (new, contacted, closed).
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
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  const { id } = await params;
  if (!id) return fail("VALIDATION_ERROR", "Inquiry ID is required.", 422);

  const { status } = await request.json();

  if (status && !["new", "contacted", "closed"].includes(status)) {
    return fail("VALIDATION_ERROR", "Invalid inquiry status.", 422);
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    return ok({ id, status, message: "Inquiry status updated successfully!" });
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[UpdateInquiry:ERROR]", error.message);
      return fail("SERVER_ERROR", error.message, 500);
    }

    return ok(data);
  } catch (err: any) {
    console.error("[UpdateInquiry:EXCEPTION]", err);
    return fail("SERVER_ERROR", "Failed to update inquiry.", 500);
  }
}
