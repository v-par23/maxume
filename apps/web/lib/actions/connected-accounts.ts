"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function disconnectGithub() {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // Goes through the service role: the authenticated role has no access to
  // the vault schema, so a plain row delete here would leave the stored
  // access token's Vault secret orphaned instead of actually removed.
  const serviceClient = createServiceRoleSupabaseClient()
  await serviceClient.rpc("disconnect_connected_account", {
    p_user_id: user.id,
    p_provider: "github",
  })
  revalidatePath("/settings/integrations")
}
