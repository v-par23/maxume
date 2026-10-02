"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export type ProfileFormState = { error?: string; success?: boolean }

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const slug = String(formData.get("slug") ?? "").trim()
  const full_name = String(formData.get("full_name") ?? "").trim()
  const headline = String(formData.get("headline") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()
  const contact_email = String(formData.get("contact_email") ?? "").trim()
  const portfolio_visibility = String(formData.get("portfolio_visibility") ?? "private")

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers, and hyphens only." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      slug,
      full_name,
      headline: headline || null,
      bio: bio || null,
      location: location || null,
      contact_email: contact_email || null,
      portfolio_visibility,
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.code === "23505" ? "That slug is already taken." : error.message }
  }

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true }
}
