"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export async function createSkill(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in.")

  const { error } = await supabase.from("skills").insert({
    user_id: user.id,
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? "other"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/skills")
  revalidatePath("/dashboard")
}

export async function deleteSkill(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const id = String(formData.get("id") ?? "")
  const { error } = await supabase.from("skills").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/skills")
  revalidatePath("/dashboard")
}
