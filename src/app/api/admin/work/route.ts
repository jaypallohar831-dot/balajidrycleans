/**
 * /api/admin/work
 * ───────────────
 * Admin API to manage portfolio / work showcase:
 * - GET: list all work items + summary statistics
 * - POST: add a new work project
 * - PUT: update an existing work project
 * - DELETE: remove a work project
 */

import { NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  getAllWorksForAdmin,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem,
} from "@/lib/worksStore";
import { ok, fail } from "@/lib/response";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const items = await getAllWorksForAdmin();

    const stats = {
      total: items.length,
      active: items.filter((w) => w.is_active).length,
      featured: items.filter((w) => w.is_featured).length,
      categories: Array.from(new Set(items.map((w) => w.category))).length,
    };

    return ok({ items, stats });
  } catch (err: unknown) {
    console.error("[AdminWork:GET_ERROR]", err);
    return fail("SERVER_ERROR", "Failed to retrieve work items.", 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const body = await request.json();
    const {
      title,
      category,
      description,
      before_image,
      after_image,
      tag_text,
      customer_note,
      is_featured,
      is_active,
      display_order,
    } = body;

    if (!title || !after_image) {
      return fail(
        "VALIDATION_ERROR",
        "Title and After Photo are required.",
        422
      );
    }

    const created = await createWorkItem({
      title: title.trim(),
      category: category?.trim() || "General",
      description: description?.trim() || "Professional dry cleaning & steam press.",
      before_image: before_image?.trim() || null,
      after_image: after_image.trim(),
      tag_text: tag_text?.trim() || null,
      customer_note: customer_note?.trim() || null,
      is_featured: !!is_featured,
      is_active: is_active !== false,
      display_order: typeof display_order === "number" ? display_order : 0,
    });

    return ok(created, 201);
  } catch (err: unknown) {
    console.error("[AdminWork:POST_ERROR]", err);
    return fail("SERVER_ERROR", "Failed to add work project.", 500);
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return fail("VALIDATION_ERROR", "Work item ID is required.", 422);
    }

    const updated = await updateWorkItem(id, updates);
    if (!updated) {
      return fail("NOT_FOUND", "Work project not found.", 404);
    }

    return ok(updated);
  } catch (err: unknown) {
    console.error("[AdminWork:PUT_ERROR]", err);
    return fail("SERVER_ERROR", "Failed to update work project.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin authorization required.", 401);
  }

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return fail("VALIDATION_ERROR", "Work ID is required.", 422);
    }

    const success = await deleteWorkItem(id);
    if (!success) {
      return fail("NOT_FOUND", "Failed to delete work project.", 404);
    }

    return ok({ message: "Work project deleted successfully." });
  } catch (err: unknown) {
    console.error("[AdminWork:DELETE_ERROR]", err);
    return fail("SERVER_ERROR", "Failed to delete work project.", 500);
  }
}
