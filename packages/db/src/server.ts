import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types.generated"

export interface CookieAdapter {
  getAll(): { name: string; value: string }[]
  setAll(
    cookies: { name: string; value: string; options: Record<string, unknown> }[]
  ): void
}

/** Session-aware client for use in Server Components / Route Handlers, scoped to the signed-in user (RLS applies). */
export function createServerSupabaseClient(cookies: CookieAdapter) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
}

/**
 * Service-role client for trusted backend code only (apply-executor, resume renderer,
 * GitHub sync). Bypasses RLS — never expose to client code or use for a request's own
 * user-scoped reads, only for operations that have already resolved and authorized the user.
 */
export function createServiceRoleSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
