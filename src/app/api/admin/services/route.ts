/**
 * /api/admin/services
 * ───────────────────
 * Manage services: list all, add, edit, reorder, and toggle active.
 */

import { NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";
import { siteConfig } from "@/config/site";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

  if (isMock) {
    return ok(
      siteConfig.services.map((s, idx) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        icon: s.icon,
        inquiry: s.inquiry,
        display_order: idx + 1,
        is_active: true,
      }))
    );
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback to siteConfig services
      return ok(
        siteConfig.services.map((s, idx) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
          inquiry: s.inquiry,
          display_order: idx + 1,
          is_active: true,
        }))
      );
    }

    return ok(data);
  } catch (err: any) {
    console.error("[AdminServices:GET_ERROR]", err);
    return fail("SERVER_ERROR", "Failed to retrieve services.", 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const body = await request.json();
    const { id, title, description, icon, inquiry, display_order, is_active } = body;

    if (!title || !description) {
      return fail("VALIDATION_ERROR", "Title and description are required.", 422);
    }

    const serviceId =
      id ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

    if (isMock) {
      return ok({
        id: serviceId,
        title,
        description,
        icon: icon || "Sparkles",
        inquiry: inquiry || `Hello Balaji Dry Cleaners! I would like to get my ${title} dry cleaned.`,
        display_order: display_order || 99,
        is_active: is_active !== false,
      }, 201);
    }

    const db = getServiceClient();
    const { data, error } = await db
      .from("services")
      .insert({
        id: serviceId,
        title,
        description,
        icon: icon || "Sparkles",
        inquiry: inquiry || `Hello Balaji Dry Cleaners! I would like to get my ${title} dry cleaned.`,
        display_order: display_order || 99,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("[AdminServices:INSERT_ERROR]", error.message);
      return fail("SERVER_ERROR", error.message, 500);
    }

    return ok(data, 201);
  } catch (err: any) {
    console.error("[AdminServices:POST_EXCEPTION]", err);
    return fail("SERVER_ERROR", "Failed to create new service.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const body = await request.json();
    const { id, title, description, icon, inquiry, display_order, is_active, reorder } = body;

    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

    if (isMock) {
      return ok({ message: "Services updated successfully!" });
    }

    const db = getServiceClient();

    // Batch reorder support: reorder = [{ id, display_order }]
    if (Array.isArray(reorder)) {
      for (const item of reorder) {
        await db
          .from("services")
          .update({ display_order: item.display_order })
          .eq("id", item.id);
      }
      return ok({ message: "Services reordered successfully!" });
    }

    if (!id) {
      return fail("VALIDATION_ERROR", "Service ID is required.", 422);
    }

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (inquiry !== undefined) updates.inquiry = inquiry;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await db
      .from("services")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[AdminServices:UPDATE_ERROR]", error.message);
      return fail("SERVER_ERROR", error.message, 500);
    }

    return ok(data);
  } catch (err: any) {
    console.error("[AdminServices:PATCH_EXCEPTION]", err);
    return fail("SERVER_ERROR", "Failed to update service.", 500);
  }
}
