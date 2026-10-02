import "server-only"
import { createHash } from "node:crypto"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export type RequestUser = { userId: string; source: "web" | "cli" }

/**
 * Resolves who's calling an /api/v1 route: a signed-in web session cookie
 * first, else a CLI personal-access-token (`Authorization: Bearer <token>`).
 * Route handlers should always filter queries by the returned userId
 * explicitly rather than relying solely on RLS, since the CLI path reads
 * with the service-role client (cli_tokens isn't a Supabase Auth session).
 */
export async function resolveRequestUser(request: Request): Promise<RequestUser | null> {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) return { userId: user.id, source: "web" }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null

  const tokenHash = createHash("sha256").update(token).digest("hex")
  const serviceClient = createServiceRoleSupabaseClient()
  const { data: tokenRow } = await serviceClient
    .from("cli_tokens")
    .select("id, user_id, revoked_at, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (!tokenRow || tokenRow.revoked_at) return null
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null

  await serviceClient
    .from("cli_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id)

  return { userId: tokenRow.user_id, source: "cli" }
}
