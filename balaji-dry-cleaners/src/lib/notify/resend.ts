/**
 * notify/resend.ts — Resend transactional email sender.
 * ──────────────────────────────────────────────────────
 * Dispatches HTML emails via Resend API and logs results to `notification_logs`.
 * NEVER throws an uncaught error.
 */

import { Resend } from "resend";
import { logNotification } from "./logger";

// Default sender address: customize in RESEND_FROM_EMAIL env or default
const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || "Balaji Dry Cleaners <orders@balajidrycleaners.in>";

let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: "email_owner" | "email_customer";
  metadata?: Record<string, unknown>;
}

export async function sendEmail({
  to,
  subject,
  html,
  type,
  metadata = {},
}: SendEmailOptions): Promise<boolean> {
  const resend = getResendClient();

  if (!resend) {
    console.warn(`[Resend:SKIPPED] RESEND_API_KEY is not configured. Email to ${to} skipped.`);
    await logNotification({
      type,
      target: to,
      status: "skipped",
      error: "RESEND_API_KEY not set or placeholder",
      metadata: { subject, ...metadata },
    });
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[Resend:ERROR] Failed to send email to ${to}:`, error.message);
      await logNotification({
        type,
        target: to,
        status: "failed",
        error: error.message,
        metadata: { subject, ...metadata },
      });
      return false;
    }

    await logNotification({
      type,
      target: to,
      status: "sent",
      metadata: { id: data?.id, subject, ...metadata },
    });
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`[Resend:EXCEPTION] Error sending email to ${to}:`, errorMsg);
    await logNotification({
      type,
      target: to,
      status: "failed",
      error: errorMsg,
      metadata: { subject, ...metadata },
    });
    return false;
  }
}
