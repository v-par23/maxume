"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"

function parseList(raw: FormDataEntryValue | null) {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function createProject(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in.")

  const name = String(formData.get("name") ?? "")
  const is_current = formData.get("is_current") === "on"

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    slug: slugify(name) || crypto.randomUUID().slice(0, 8),
    name,
    summary: String(formData.get("summary") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    tech_stack: parseList(formData.get("tech_stack")),
    links: {
      repo_url: String(formData.get("repo_url") ?? "") || undefined,
      live_url: String(formData.get("live_url") ?? "") || undefined,
    },
    is_current,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}

export async function deleteProject(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const id = String(formData.get("id") ?? "")
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}
