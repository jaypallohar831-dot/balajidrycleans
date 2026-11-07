/**
 * notify/whatsapp.ts — Meta WhatsApp Cloud API dispatcher.
 * ──────────────────────────────────────────────────────────
 * Sends WhatsApp alerts to the owner's phone number.
 * If WHATSAPP_CLOUD_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured,
 * skips silently and logs a warning.
 * NEVER throws an unhandled error.
 */

import { logNotification } from "./logger";

export interface SendWhatsAppOptions {
  to?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function sendWhatsAppToOwner({
  to,
  message,
  metadata = {},
}: SendWhatsAppOptions): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ownerNumber = to || process.env.OWNER_WHATSAPP_NUMBER;

  // If token is missing, dummy, or phone number ID is missing: skip silently with a warning
  if (
    !token ||
    !phoneNumberId ||
    !ownerNumber ||
    token.startsWith("your-") ||
    phoneNumberId.startsWith("your-")
  ) {
    console.warn(
      "[WhatsApp:SKIPPED] WHATSAPP_CLOUD_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured. Notification skipped."
    );
    await logNotification({
      type: "whatsapp_owner",
      target: ownerNumber || "unknown",
      status: "skipped",
      error: "WhatsApp Cloud API credentials not configured",
      metadata,
    });
    return false;
  }

  // Clean recipient number: digits only (e.g. 919876543210)
  const recipient = ownerNumber.replace(/[^0-9]/g, "");
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = JSON.stringify(await res.json());
      } catch {
        errBody = await res.text();
      }
      console.error(
        `[WhatsApp:ERROR] Meta API returned ${res.status}: ${errBody}`
      );
      await logNotification({
        type: "whatsapp_owner",
        target: recipient,
        status: "failed",
        error: `Meta API HTTP ${res.status}: ${errBody}`,
        metadata,
      });
      return false;
    }

    const data = await res.json();
    await logNotification({
      type: "whatsapp_owner",
      target: recipient,
      status: "sent",
      metadata: { response: data, ...metadata },
    });
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("[WhatsApp:EXCEPTION] Failed to send WhatsApp message:", errorMsg);
    await logNotification({
      type: "whatsapp_owner",
      target: recipient,
      status: "failed",
      error: errorMsg,
      metadata,
    });
    return false;
  }
}
