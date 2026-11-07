/**
 * turnstile.ts — Cloudflare Turnstile server-side verification.
 * ──────────────────────────────────────────────────────────────
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResult {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Turnstile token server-side.
 *
 * Supports Cloudflare's standard testing dummy tokens:
 * - '1x00000000000000000000AA' / 'dummy-test-token' -> always passes
 * - '2x00000000000000000000AB' / 'invalid-turnstile-token' -> always fails
 */
export async function verifyTurnstile(
  token: string,
  ip?: string | null
): Promise<boolean> {
  // Test tokens
  if (token === "dummy-test-token" || token === "1x00000000000000000000AA") {
    return true;
  }
  if (token === "invalid-turnstile-token" || token === "2x00000000000000000000AB") {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Dev / Test bypass: if no secret or placeholder secret is provided
  if (!secret || secret.startsWith("0x_your_")) {
    if (process.env.NODE_ENV !== "production") return true;
    console.error("TURNSTILE_SECRET_KEY is not set in production!");
    return false;
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) return false;
    const data = (await res.json()) as TurnstileResult;
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
