/**
 * response.ts — Consistent API response helpers.
 * ────────────────────────────────────────────────
 * Every public route returns:
 *   { ok: true, data }   or
 *   { ok: false, error: { code, message } }
 */

import { NextResponse } from "next/server";

// ── Success ───────────────────────────────────────────────
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

// ── Error ─────────────────────────────────────────────────
export function fail(
  code: string,
  message: string,
  status = 400
) {
  return NextResponse.json(
    { ok: false, error: { code, message } },
    { status }
  );
}

// ── Common error shortcuts ────────────────────────────────
export const ERRORS = {
  VALIDATION: (msg: string) => fail("VALIDATION_ERROR", msg, 422),
  RATE_LIMIT: () =>
    fail(
      "RATE_LIMIT",
      "Bahut zyada requests aa rahi hain. Thoda ruk kar try karein.",
      429
    ),
  TURNSTILE: () =>
    fail(
      "TURNSTILE_FAILED",
      "Bot verification fail ho gayi. Page refresh karke dubara try karein.",
      403
    ),
  SERVER: () =>
    fail(
      "SERVER_ERROR",
      "Kuch gadbad ho gayi. Thodi der baad try karein ya WhatsApp karein.",
      500
    ),
  METHOD: () =>
    fail("METHOD_NOT_ALLOWED", "Ye method allowed nahi hai.", 405),
} as const;
