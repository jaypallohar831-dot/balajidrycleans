/**
 * notify/defer.ts — Non-blocking background task scheduler.
 * ─────────────────────────────────────────────────────────
 * Uses Next.js after() when running inside a Next.js request scope,
 * with seamless fire-and-forget fallback when executed outside
 * request context (e.g. in standalone tests or scripts).
 */

import { after } from "next/server";

export function scheduleBackgroundTask(task: () => Promise<void>): void {
  try {
    after(async () => {
      try {
        await task();
      } catch (err) {
        console.error("[BackgroundTask:ERROR]", err);
      }
    });
  } catch {
    // Fallback: outside Next.js request scope (tests / scripts)
    task().catch((err) => {
      console.error("[BackgroundTask:FIRE_AND_FORGET_ERROR]", err);
    });
  }
}
