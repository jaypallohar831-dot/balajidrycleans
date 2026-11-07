/**
 * Supabase browser client (anon key).
 * ────────────────────────────────────
 * Uses the public NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Safe to import from client components — all queries respect RLS.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Singleton anon client for the browser.
 * Re-uses the same instance across re-renders.
 */
let _client: SupabaseClient<Database> | null = null;

export function getAnonClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase browser environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
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
