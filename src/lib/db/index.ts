import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Single shared Supabase connection for the whole app, server-side only.
// Uses the service_role key, which bypasses Row Level Security — every
// request is already authorized in app code (requireAdmin(), session
// ownership checks), matching how the app worked against local SQLite.

declare global {
  // eslint-disable-next-line no-var
  var __medistoreDb__: SupabaseClient | undefined;
}

function createConnection(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_API_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_API_KEY. Set them in .env.local (see .env.example)."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const db: SupabaseClient = globalThis.__medistoreDb__ ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__medistoreDb__ = db;
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

// Throws if a Supabase response carries an error, otherwise returns data.
// Every db/*.ts function funnels its query result through this so failures
// surface immediately instead of silently returning null/undefined.
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
