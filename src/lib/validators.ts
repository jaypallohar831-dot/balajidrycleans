/**
 * validators.ts — Zod v4 schemas for all public API payloads.
 * ─────────────────────────────────────────────────────────────
 * All strings are trimmed and sanitized.
 * Phone numbers are normalised to +91XXXXXXXXXX.
 */

import { z } from "zod";

// ── Helpers ──────────────────────────────────────────────

/** Strip HTML tags and collapse whitespace */
export function sanitize(s: string): string {
  return s
    .replace(/<[^>]*>/g, "") // strip HTML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // strip control chars
    .trim()
    .replace(/\s+/g, " "); // collapse whitespace
}

/** Zod preprocess: trim + sanitize */
const cleanStr = z.preprocess(
  (v) => (typeof v === "string" ? sanitize(v) : v),
  z.string()
);

/** Indian phone: 10 digits, optionally prefixed with +91 / 91 / 0 */
const INDIAN_PHONE_RE = /^(?:\+?91|0)?([6-9]\d{9})$/;

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = INDIAN_PHONE_RE.exec(digits);
  if (!m) return "";
  return `+91${m[1]}`;
}

export function isValidPickupDate(v: string): boolean {
  const parts = v.split("-");
  let target: Date;
  if (parts.length === 3 && parts[0].length === 4) {
    target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    target = new Date(v);
  }
  if (isNaN(target.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfMax = new Date(startOfToday);
  endOfMax.setDate(endOfMax.getDate() + 30);
  endOfMax.setHours(23, 59, 59, 999);

  return target >= startOfToday && target <= endOfMax;
}

// ── Shared fields ────────────────────────────────────────

// Honeypot allows any string; if filled, route will silently succeed with 200
const honeypotField = z.string().optional().default("");

const turnstileField = z.string().min(1, "Turnstile token zaroori hai.");

const phoneField = cleanStr.pipe(
  z
    .string()
    .min(10, "Phone number sahi format mein daalein.")
    .max(20, "Phone number sahi format mein daalein.")
    .transform((v) => normalisePhone(v))
    .refine((v) => v.length > 0, {
      message: "Sahi 10-digit Indian phone number daalein (jaise: 9876543210).",
    })
);

// ── Inquiry schema ───────────────────────────────────────

export const inquirySchema = z.object({
  name: cleanStr.pipe(
    z
      .string()
      .min(2, "Naam kam se kam 2 akshar ka hona chahiye.")
      .max(60, "Naam 60 akshar se chhota hona chahiye.")
  ),
  phone: phoneField,
  message: cleanStr
    .pipe(z.string().max(500, "Message 500 akshar se chhota hona chahiye."))
    .optional()
    .default(""),
  email: z.string().email("Sahi email address daalein.").optional().or(z.literal("")).default(""),
  turnstileToken: turnstileField,
  honeypot: honeypotField,
});

export type InquiryInput = z.infer<typeof inquirySchema>;

// ── Booking schema ───────────────────────────────────────

export const VALID_SERVICES = [
  "suit-blazer-sherwani",
  "saree-lehenga-ghagra",
  "sweater-jacket-shawl",
  "rajai-kambal-parde",
  "daily-wash-iron",
  "stain-removal",
] as const;

export const bookingSchema = z.object({
  name: cleanStr.pipe(
    z
      .string()
      .min(2, "Naam kam se kam 2 akshar ka hona chahiye.")
      .max(60, "Naam 60 akshar se chhota hona chahiye.")
  ),
  phone: phoneField,
  email: z.string().email("Sahi email address daalein.").optional().or(z.literal("")).default(""),
  service: cleanStr.pipe(
    z.enum(VALID_SERVICES, {
      error: "Sahi service select karein.",
    })
  ),
  pickupSlot: z.enum(["subah", "dopahar", "shaam"], {
    error: "Pickup time select karein: Subah, Dopahar ya Shaam.",
  }),
  pickupDate: cleanStr.pipe(
    z.string().refine((v) => isValidPickupDate(v), {
      message: "Pickup date aaj ya aane wale 30 din ke andar honi chahiye.",
    })
  ),
  address: cleanStr.pipe(
    z
      .string()
      .min(10, "Address kam se kam 10 akshar ka hona chahiye.")
      .max(300, "Address 300 akshar se chhota hona chahiye.")
  ),
  notes: cleanStr
    .pipe(z.string().max(500, "Notes 500 akshar se chhota hona chahiye."))
    .optional()
    .default(""),
  turnstileToken: turnstileField,
  honeypot: honeypotField,
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ── Formatting helper ────────────────────────────────────

/** Flatten Zod errors into a single user-friendly string. */
export function formatZodErrors(err: z.ZodError): string {
  return err.issues.map((e) => e.message).join(" ");
}
