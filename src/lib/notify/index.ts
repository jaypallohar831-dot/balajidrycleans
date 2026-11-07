/**
 * notify/index.ts — Notification orchestrator.
 * ─────────────────────────────────────────────
 * Dispatches owner and customer notifications asynchronously.
 * Wraps all tasks in Promise.allSettled so failures in one channel never affect another.
 */

import { siteConfig } from "@/config/site";
import {
  renderOwnerBookingEmail,
  renderOwnerInquiryEmail,
  renderCustomerConfirmationEmail,
} from "./emailTemplates";
import { sendEmail } from "./resend";
import { sendWhatsAppToOwner } from "./whatsapp";
export { scheduleBackgroundTask } from "./defer";

// Helper to resolve service id to title
function getServiceTitle(serviceId: string): string {
  const service = siteConfig.services.find((s) => s.id === serviceId);
  return service?.title || serviceId;
}

export interface BookingNotificationData {
  bookingCode: string;
  name: string;
  phone: string;
  service: string;
  pickupSlot: string;
  pickupDate: string;
  address: string;
  notes?: string | null;
  email?: string | null;
}

export async function notifyNewBooking(data: BookingNotificationData): Promise<void> {
  const serviceTitle = getServiceTitle(data.service);
  const ownerEmail = process.env.OWNER_EMAIL;
  const cleanCustomerPhone = data.phone.replace(/[^0-9]/g, "");
  const waReplyLink = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
    `Namaste ${data.name} ji! Balaji Dry Cleaners se aapki booking (${data.bookingCode}) confirm ho gayi hai.`
  )}`;

  const slotLabels: Record<string, string> = {
    subah: "Subah (8:00 AM - 12:00 PM)",
    dopahar: "Dopahar (12:00 PM - 4:00 PM)",
    shaam: "Shaam (4:00 PM - 8:00 PM)",
  };
  const slotDisplay = slotLabels[data.pickupSlot.toLowerCase()] || data.pickupSlot;

  // 1. WhatsApp Text for Owner
  const whatsappBody = `🧺 *NAYI BOOKING: ${data.bookingCode}*
──────────────────────
👤 *Customer:* ${data.name}
📞 *Phone:* ${data.phone}
✨ *Service:* ${serviceTitle}
📅 *Date:* ${data.pickupDate}
⏰ *Slot:* ${slotDisplay}
📍 *Address:* ${data.address}
${data.notes ? `📝 *Note:* ${data.notes}\n` : ""}
👉 *Reply to customer:* ${waReplyLink}`;

  const tasks: Promise<unknown>[] = [];

  // Dispatch WhatsApp to Owner
  tasks.push(
    sendWhatsAppToOwner({
      message: whatsappBody,
      metadata: { bookingCode: data.bookingCode, customerName: data.name },
    })
  );

  // Dispatch Email to Owner
  if (ownerEmail) {
    const { subject, html } = renderOwnerBookingEmail({
      bookingCode: data.bookingCode,
      name: data.name,
      phone: data.phone,
      service: data.service,
      serviceTitle,
      pickupSlot: data.pickupSlot,
      pickupDate: data.pickupDate,
      address: data.address,
      notes: data.notes,
      customerEmail: data.email,
    });

    tasks.push(
      sendEmail({
        to: ownerEmail,
        subject,
        html,
        type: "email_owner",
        metadata: { bookingCode: data.bookingCode },
      })
    );
  }

  // Optional: Dispatch Customer Confirmation Email if provided
  if (data.email && data.email.includes("@")) {
    const customerEmailContent = renderCustomerConfirmationEmail({
      bookingCode: data.bookingCode,
      name: data.name,
      serviceTitle,
      pickupSlot: data.pickupSlot,
      pickupDate: data.pickupDate,
      address: data.address,
    });

    tasks.push(
      sendEmail({
        to: data.email,
        subject: customerEmailContent.subject,
        html: customerEmailContent.html,
        type: "email_customer",
        metadata: { bookingCode: data.bookingCode },
      })
    );
  }

  await Promise.allSettled(tasks);
}

export interface InquiryNotificationData {
  name: string;
  phone: string;
  message?: string | null;
  email?: string | null;
}

export async function notifyNewInquiry(data: InquiryNotificationData): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  const cleanCustomerPhone = data.phone.replace(/[^0-9]/g, "");
  const waReplyLink = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
    `Namaste ${data.name} ji! Balaji Dry Cleaners se aapka inquiry message mila.`
  )}`;

  // 1. WhatsApp Text for Owner
  const whatsappBody = `💬 *NAYI WEBSITE INQUIRY*
──────────────────────
👤 *Customer:* ${data.name}
📞 *Phone:* ${data.phone}
${data.email ? `✉️ *Email:* ${data.email}\n` : ""}
📝 *Message:*
"${data.message || "Koi message nahi likha gaya."}"

👉 *Reply to customer:* ${waReplyLink}`;

  const tasks: Promise<unknown>[] = [];

  // Dispatch WhatsApp to Owner
  tasks.push(
    sendWhatsAppToOwner({
      message: whatsappBody,
      metadata: { customerName: data.name, customerPhone: data.phone },
    })
  );

  // Dispatch Email to Owner
  if (ownerEmail) {
    const { subject, html } = renderOwnerInquiryEmail({
      name: data.name,
      phone: data.phone,
      message: data.message,
      customerEmail: data.email,
    });

    tasks.push(
      sendEmail({
        to: ownerEmail,
        subject,
        html,
        type: "email_owner",
        metadata: { customerName: data.name },
      })
    );
  }

  await Promise.allSettled(tasks);
}
