/**
 * GET /api/work
 * ─────────────
 * Public API to fetch active work showcase items.
 * Cached and safe for high traffic.
 */

import { getPublicWorks } from "@/lib/worksStore";
import { ok, fail } from "@/lib/response";

export async function GET() {
  try {
    const works = await getPublicWorks();
    const res = ok(works, 200);
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return res;
  } catch (err: unknown) {
    console.error("[WorkPublicApi:GET]", err);
    return fail("SERVER_ERROR", "Failed to load showcase items.", 500);
  }
}

