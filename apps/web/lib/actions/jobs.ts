"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase/server"

function parseHighlights(raw: FormDataEntryValue | null) {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function createJob(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in.")

  const is_current = formData.get("is_current") === "on"

  const { error } = await supabase.from("work_history").insert({
    user_id: user.id,
    company: String(formData.get("company") ?? ""),
    title: String(formData.get("title") ?? ""),
    location: String(formData.get("location") ?? "") || null,
    start_date: String(formData.get("start_date") ?? ""),
    end_date: is_current ? null : String(formData.get("end_date") ?? "") || null,
    is_current,
    description: String(formData.get("description") ?? "") || null,
    highlights: parseHighlights(formData.get("highlights")),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/jobs")
  revalidatePath("/dashboard")
}

export async function deleteJob(formData: FormData) {
  const supabase = await getServerSupabaseClient()
  const id = String(formData.get("id") ?? "")
  const { error } = await supabase.from("work_history").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/jobs")
  revalidatePath("/dashboard")
}
