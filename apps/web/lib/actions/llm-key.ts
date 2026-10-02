"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export type LlmKeyFormState = { error?: string; success?: boolean }

export async function saveLlmApiKey(
  _prev: LlmKeyFormState,
  formData: FormData
): Promise<LlmKeyFormState> {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const apiKey = String(formData.get("api_key") ?? "").trim()
  if (apiKey.length < 20) {
    return { error: "That doesn't look like a valid API key." }
  }

  // Writing the secret requires the service-role key — set_llm_api_key is
  // locked down to service_role only (see 0005_vault_functions.sql) because
  // p_user_id is a plain parameter, not derived from auth.uid().
  const serviceClient = createServiceRoleSupabaseClient()
  const { error } = await serviceClient.rpc("set_llm_api_key", {
    p_user_id: user.id,
    p_provider: "anthropic",
    p_api_key: apiKey,
  })

  if (error) return { error: error.message }

  revalidatePath("/settings/api-key")
  return { success: true }
}
