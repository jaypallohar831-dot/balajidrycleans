/**
 * GET /api/services
 * ──────────────────
 * Returns the list of active services from the site config.
 * No auth, no rate limit — this is public, cacheable data.
 */

import { siteConfig } from "@/config/site";
import { ok } from "@/lib/response";

export async function GET() {
  const services = siteConfig.services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
  }));

  const res = ok(services, 200);
  res.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  return res;
}
