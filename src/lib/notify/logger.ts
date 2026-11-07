/**
 * notify/logger.ts — Notification audit logger.
 * ──────────────────────────────────────────────
 * Logs notification attempts and failures to `notification_logs` table in Supabase.
 * NEVER throws an exception so it can never crash the parent request.
 */

import { getServiceClient } from "@/lib/supabase/server";

export interface LogNotificationParams {
  type: "email_owner" | "whatsapp_owner" | "email_customer";
  target: string;
  status: "sent" | "failed" | "skipped";
  error?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logNotification({
  type,
  target,
  status,
  error = null,
  metadata = {},
}: LogNotificationParams): Promise<void> {
  try {
    // If Supabase is not configured or in mock/test mode, log to console
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")
    ) {
      if (status === "failed") {
        console.error(`[NotificationLog:FAILED] [${type}] to ${target}: ${error}`);
      } else if (status === "skipped") {
        console.warn(`[NotificationLog:SKIPPED] [${type}] to ${target}: ${error || "not configured"}`);
      } else {
        console.log(`[NotificationLog:SENT] [${type}] to ${target}`);
      }
      return;
    }

    const db = getServiceClient();
    const { error: dbErr } = await db.from("notification_logs").insert({
      type,
      target,
      status,
      error,
      metadata: metadata as any,
    });

    if (dbErr) {
      console.error("[NotificationLog:DB_ERROR] Failed to save log:", dbErr.message);
    }
  } catch (err) {
    // Never propagate error from logger
    console.error("[NotificationLog:CRITICAL_FAIL]", err);
  }
}
