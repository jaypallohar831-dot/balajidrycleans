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

const turnstileField = z.string().min(1, "Turnstile verification token is required.");

const phoneField = cleanStr.pipe(
  z
    .string()
    .min(10, "Please enter a valid phone number.")
    .max(20, "Please enter a valid phone number.")
    .transform((v) => normalisePhone(v))
    .refine((v) => v.length > 0, {
      message: "Please enter a valid 10-digit Indian phone number (e.g. 9876543210).",
    })
);

// ── Inquiry schema ───────────────────────────────────────

export const inquirySchema = z.object({
  name: cleanStr.pipe(
    z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(60, "Name must be under 60 characters.")
  ),
  phone: phoneField,
  message: cleanStr
    .pipe(z.string().max(500, "Message must be under 500 characters."))
    .optional()
    .default(""),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")).default(""),
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
      .min(2, "Name must be at least 2 characters.")
      .max(60, "Name must be under 60 characters.")
  ),
  phone: phoneField,
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")).default(""),
  service: cleanStr.pipe(
    z.enum(VALID_SERVICES, {
      error: "Please select a valid service.",
    })
  ),
  pickupSlot: z.enum(["subah", "dopahar", "shaam"], {
    error: "Please select a valid pickup time slot: Morning, Afternoon, or Evening.",
  }),
  pickupDate: cleanStr.pipe(
    z.string().refine((v) => isValidPickupDate(v), {
      message: "Pickup date must be today or within the next 30 days.",
    })
  ),
  address: cleanStr.pipe(
    z
      .string()
      .min(10, "Address must be at least 10 characters.")
      .max(300, "Address must be under 300 characters.")
  ),
  notes: cleanStr
    .pipe(z.string().max(500, "Notes must be under 500 characters."))
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
