import { redirect } from "next/navigation"
import { getServerSupabaseClient } from "@/lib/supabase/server"

/** Resolves the signed-in user's profile row, redirecting to /login if unauthenticated. */
export async function requireCurrentProfile() {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    throw new Error(`Failed to load profile for user ${user.id}: ${error?.message}`)
  }

  return { supabase, user, profile }
}
