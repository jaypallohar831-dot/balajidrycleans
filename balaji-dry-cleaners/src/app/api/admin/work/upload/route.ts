/**
 * POST /api/admin/work/upload
 * ───────────────────────────
 * Upload work project photos directly from admin device (Mobile/Desktop).
 * Saves to /public/uploads/work/ and returns static URL.
 */

import { NextRequest } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return fail("UNAUTHORIZED", "Admin login zaroori hai.", 401);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return fail("VALIDATION_ERROR", "Kripya koi image file select karein.", 422);
    }

    // Check mime type
    const mime = file.type.toLowerCase();
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimes.includes(mime)) {
      return fail(
        "VALIDATION_ERROR",
        "Keval JPG, PNG ya WEBP images hi allowed hain.",
        422
      );
    }

    // Check size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return fail("VALIDATION_ERROR", "Image size 10MB se kam hona chahiye.", 422);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate safe unique filename
    const ext = path.extname(file.name) || ".jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9.]/g, "").toLowerCase() || ".jpg";
    const filename = `work_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;

    // 1. If Supabase is configured, upload to Supabase Cloud Storage
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

    if (!isMock) {
      try {
        const db = getServiceClient();
        const { error: uploadError } = await db.storage
          .from("works")
          .upload(filename, buffer, {
            contentType: mime,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = db.storage
            .from("works")
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return ok({ url: publicUrlData.publicUrl, filename });
          }
        } else {
          console.warn("[WorkUpload:SupabaseStorageFallback]", uploadError.message);
        }
      } catch (storageErr) {
        console.warn("[WorkUpload:StorageFallback]", storageErr);
      }
    }

    // 2. Fallback: Save to local public/uploads/work
    const uploadDir = path.join(process.cwd(), "public", "uploads", "work");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/work/${filename}`;
    return ok({ url: publicUrl, filename });
  } catch (err: unknown) {
    console.error("[WorkUpload:POST_ERROR]", err);
    return fail("SERVER_ERROR", "Image upload nahi ho payi. Dobara try karein.", 500);
  }
}

