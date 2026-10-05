"use server"

import { randomBytes, createHash } from "node:crypto"
import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export type CreateTokenState = { error?: string; rawToken?: string }

export async function createCliToken(
  _prev: CreateTokenState,
  formData: FormData
): Promise<CreateTokenState> {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Give the token a name." }

  const rawToken = `mx_${randomBytes(24).toString("base64url")}`
  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
  const tokenPrefix = rawToken.slice(0, 12)

  const { error } = await supabase.from("cli_tokens").insert({
    user_id: user.id,
    name,
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
  })
  if (error) return { error: error.message }

  revalidatePath("/settings/tokens")
  return { rawToken }
}

export async function revokeCliToken(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const id = String(formData.get("id") ?? "")
  await supabase.from("cli_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/settings/tokens")
}
