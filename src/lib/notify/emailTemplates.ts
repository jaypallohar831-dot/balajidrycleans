/**
 * notify/emailTemplates.ts — Responsive HTML email templates.
 * ────────────────────────────────────────────────────────────
 * Clean, inline-styled emails for owner alerts and customer receipts.
 */

import { siteConfig } from "@/config/site";

interface OwnerBookingEmailProps {
  bookingCode: string;
  name: string;
  phone: string;
  service: string;
  serviceTitle: string;
  pickupSlot: string;
  pickupDate: string;
  address: string;
  notes?: string | null;
  customerEmail?: string | null;
}

export function renderOwnerBookingEmail({
  bookingCode,
  name,
  phone,
  serviceTitle,
  pickupSlot,
  pickupDate,
  address,
  notes,
  customerEmail,
}: OwnerBookingEmailProps): { subject: string; html: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waReplyLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${name}! Balaji Dry Cleaners has received and confirmed your booking (${bookingCode}).`
  )}`;

  const slotLabels: Record<string, string> = {
    subah: "Morning (8:00 AM - 12:00 PM)",
    dopahar: "Afternoon (12:00 PM - 4:00 PM)",
    shaam: "Evening (4:00 PM - 8:00 PM)",
  };

  const slotDisplay = slotLabels[pickupSlot.toLowerCase()] || pickupSlot;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Pickup Booking - ${bookingCode}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 32px; background: #0f172a; text-align: center;">
        <h1 style="margin: 0; color: #38bdf8; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">BALAJI DRY CLEANERS</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">RK Colony, Bhilwara · New Pickup Alert</p>
      </td>
    </tr>

    <!-- Booking Badge -->
    <tr>
      <td style="padding: 24px 32px 16px 32px; text-align: center;">
        <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          New Booking Received
        </span>
        <h2 style="margin: 12px 0 4px 0; font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">${bookingCode}</h2>
        <p style="margin: 0; color: #64748b; font-size: 14px;">Doorstep garment pickup order</p>
      </td>
    </tr>

    <!-- Details Table -->
    <tr>
      <td style="padding: 8px 32px 24px 32px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="10" style="border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; width: 35%; font-weight: 500;">Customer Name:</td>
            <td style="color: #0f172a; font-weight: 700;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 500;">Phone Number:</td>
            <td style="color: #0f172a; font-weight: 700;">
              <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">📞 ${phone} (Tap to Call)</a>
            </td>
          </tr>
          ${
            customerEmail
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 500;">Customer Email:</td>
                  <td style="color: #0f172a;">${customerEmail}</td>
                </tr>`
              : ""
          }
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 500;">Service:</td>
            <td style="color: #0f172a; font-weight: 600;">✨ ${serviceTitle}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 500;">Pickup Date:</td>
            <td style="color: #0f172a; font-weight: 600;">📅 ${pickupDate}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 500;">Pickup Slot:</td>
            <td style="color: #0f172a; font-weight: 600;">⏰ ${slotDisplay}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #64748b; font-weight: 500; vertical-align: top;">Pickup Address:</td>
            <td style="color: #0f172a; font-weight: 600; line-height: 1.4;">📍 ${address}</td>
          </tr>
          ${
            notes
              ? `<tr>
                  <td style="color: #64748b; font-weight: 500; vertical-align: top;">Customer Note:</td>
                  <td style="color: #475569; font-style: italic;">"${notes}"</td>
                </tr>`
              : ""
          }
        </table>
      </td>
    </tr>

    <!-- WhatsApp Reply CTA -->
    <tr>
      <td style="padding: 0 32px 32px 32px; text-align: center;">
        <a href="${waReplyLink}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 10px rgba(37,211,102,0.3);">
          💬 Reply to Customer on WhatsApp
        </a>
        <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 12px;">Clicking this link opens a direct WhatsApp chat with the customer.</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Balaji Dry Cleaners · RK Colony, Bhilwara · Automated Website Notification
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    subject: `🔔 New Booking: ${bookingCode} - ${name} (${serviceTitle})`,
    html,
  };
}

interface OwnerInquiryEmailProps {
  name: string;
  phone: string;
  message?: string | null;
  customerEmail?: string | null;
}

export function renderOwnerInquiryEmail({
  name,
  phone,
  message,
  customerEmail,
}: OwnerInquiryEmailProps): { subject: string; html: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waReplyLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${name}! Balaji Dry Cleaners has received your inquiry.`
  )}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Website Inquiry - ${name}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 24px 32px; background: #0f172a; text-align: center;">
        <h1 style="margin: 0; color: #38bdf8; font-size: 22px;">BALAJI DRY CLEANERS</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Website Contact Form Submission</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #0f172a;">💬 New Inquiry Received</h2>
        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; width: 30%;">Name:</td>
            <td style="color: #0f172a; font-weight: 700;">${name}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Phone:</td>
            <td style="color: #0f172a; font-weight: 700;">
              <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">📞 ${phone}</a>
            </td>
          </tr>
          ${
            customerEmail
              ? `<tr><td style="color: #64748b;">Email:</td><td style="color: #0f172a;">${customerEmail}</td></tr>`
              : ""
          }
          <tr>
            <td style="color: #64748b; vertical-align: top;">Message:</td>
            <td style="color: #334155; line-height: 1.5; font-style: italic;">
              "${message || "No message text provided."}"
            </td>
          </tr>
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${waReplyLink}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
            💬 Reply on WhatsApp
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    subject: `💬 New Inquiry: ${name} (${phone})`,
    html,
  };
}

interface CustomerConfirmationEmailProps {
  bookingCode: string;
  name: string;
  serviceTitle: string;
  pickupSlot: string;
  pickupDate: string;
  address: string;
}

export function renderCustomerConfirmationEmail({
  bookingCode,
  name,
  serviceTitle,
  pickupSlot,
  pickupDate,
  address,
}: CustomerConfirmationEmailProps): { subject: string; html: string } {
  const slotLabels: Record<string, string> = {
    subah: "Morning (8:00 AM - 12:00 PM)",
    dopahar: "Afternoon (12:00 PM - 4:00 PM)",
    shaam: "Evening (4:00 PM - 8:00 PM)",
  };

  const slotDisplay = slotLabels[pickupSlot.toLowerCase()] || pickupSlot;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Pickup Booking is Confirmed - Balaji Dry Cleaners</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 24px 32px; background: #0f172a; text-align: center;">
        <h1 style="margin: 0; color: #38bdf8; font-size: 22px;">BALAJI DRY CLEANERS</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Premium Dry Cleaning · RK Colony, Bhilwara</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 8px;">✨</div>
        <h2 style="margin: 0 0 6px 0; font-size: 24px; color: #0f172a;">Booking Confirmed!</h2>
        <p style="margin: 0; color: #64748b; font-size: 14px;">Hello ${name}, we have successfully recorded your pickup order.</p>
        
        <div style="margin: 20px auto; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; max-width: 280px;">
          <p style="margin: 0; font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 700;">Booking Reference</p>
          <p style="margin: 4px 0 0 0; font-size: 26px; font-weight: 800; color: #15803d; letter-spacing: 1px;">${bookingCode}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 14px; background: #f8fafc; border-radius: 12px; padding: 8px;">
          <tr>
            <td style="color: #64748b; width: 35%;">Service:</td>
            <td style="color: #0f172a; font-weight: 600;">${serviceTitle}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Pickup Date:</td>
            <td style="color: #0f172a; font-weight: 600;">📅 ${pickupDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Pickup Time:</td>
            <td style="color: #0f172a; font-weight: 600;">⏰ ${slotDisplay}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Pickup Address:</td>
            <td style="color: #0f172a; font-weight: 600;">📍 ${address}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 32px 32px 32px; text-align: center;">
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Have a question or need to change your pickup timing?</p>
        <a href="https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
          `Hello Balaji Dry Cleaners! I have a question regarding my booking ${bookingCode}.`
        )}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
          💬 Chat on WhatsApp
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Balaji Dry Cleaners · RK Colony, Bhilwara (Rajasthan) · Phone: ${siteConfig.whatsapp}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    subject: `✨ Booking Confirmed: ${bookingCode} - Balaji Dry Cleaners`,
    html,
  };
}
