"use server"

import { redirect } from "next/navigation"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await getServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/login")
}
