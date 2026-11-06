/**
 * Supabase server-side client (service-role).
 * ──────────────────────────────────────────
 * Uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row-Level Security.
 * Import ONLY in server-side code (API routes, server actions, middleware).
 *
 * ⚠️  NEVER import this file from client components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Singleton service-role client.
 * Creates one instance per server process (cold start).
 */
let _client: SupabaseClient<Database> | null = null;

export function getServiceClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  if (!_client) {
    _client = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}
