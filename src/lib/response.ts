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
      "Too many requests. Please wait a moment and try again.",
      429
    ),
  TURNSTILE: () =>
    fail(
      "TURNSTILE_FAILED",
      "Bot verification failed. Please refresh the page and try again.",
      403
    ),
  SERVER: () =>
    fail(
      "SERVER_ERROR",
      "Something went wrong. Please try again shortly or contact us on WhatsApp.",
      500
    ),
  METHOD: () =>
    fail("METHOD_NOT_ALLOWED", "Method not allowed.", 405),
} as const;
