import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@maxume/db"

type ServiceClient = SupabaseClient<Database>
type ChangeSetItemRow = Database["public"]["Tables"]["change_set_items"]["Row"]

// profile first, then job/project/skill together (order within the tier
// doesn't matter to each other), then resume (needs the above committed so
// its snapshot is current), then github_readme last (freshest state of all).
const TARGET_PRIORITY: Record<string, number> = {
  profile: 0,
  job: 1,
  project: 1,
  skill: 1,
  resume: 2,
  github_readme: 3,
}

/**
 * Applies every confirmed change_set_item for a run. Must be called with a
 * service-role client — this is the only code path that performs real
 * mutations from an agent proposal, after a human has confirmed it.
 */
export async function applyChangeSet(supabase: ServiceClient, runId: string): Promise<void> {
  const { data: run, error: runError } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("id", runId)
    .single()

  if (runError || !run) throw new Error(`Agent run not found: ${runId}`)
  if (run.status !== "confirmed") {
    throw new Error(`Agent run ${runId} is not confirmed (status: ${run.status})`)
  }

  const { data: items, error: itemsError } = await supabase
    .from("change_set_items")
    .select("*")
    .eq("run_id", runId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true })

  if (itemsError) throw new Error(itemsError.message)

  const ordered = [...(items ?? [])].sort(
    (a, b) => (TARGET_PRIORITY[a.target] ?? 99) - (TARGET_PRIORITY[b.target] ?? 99)
  )

  await supabase.from("agent_runs").update({ status: "applying" }).eq("id", runId)

  let appliedCount = 0
  let failedCount = 0

  for (const item of ordered) {
    await supabase.from("change_set_items").update({ status: "applying" }).eq("id", item.id)

    try {
      await applyItem(supabase, run.user_id, item)
      await supabase
        .from("change_set_items")
        .update({ status: "applied", applied_at: new Date().toISOString(), error: null })
        .eq("id", item.id)
      appliedCount++
    } catch (err) {
      await supabase
        .from("change_set_items")
        .update({ status: "failed", error: err instanceof Error ? err.message : String(err) })
        .eq("id", item.id)
      failedCount++
    }
  }

  const finalStatus =
    failedCount === 0 ? "applied" : appliedCount === 0 ? "failed" : "partially_applied"

  await supabase
    .from("agent_runs")
    .update({ status: finalStatus, applied_at: new Date().toISOString() })
    .eq("id", runId)
}

async function applyItem(
  supabase: ServiceClient,
  userId: string,
  item: ChangeSetItemRow
): Promise<void> {
  const payload = (item.payload ?? {}) as Record<string, unknown>

  switch (item.target) {
    case "profile": {
      const { error } = await supabase
        .from("profiles")
        .update(payload as Database["public"]["Tables"]["profiles"]["Update"])
        .eq("id", userId)
      if (error) throw new Error(error.message)
      return
    }

    case "job": {
      if (item.action === "create") {
        const { error } = await supabase
          .from("work_history")
          .insert({ ...(payload as Record<string, unknown>), user_id: userId } as Database["public"]["Tables"]["work_history"]["Insert"])
        if (error) throw new Error(error.message)
        return
      }
      if (!item.target_id) throw new Error("Missing target_id for job update")
      const { error } = await supabase
        .from("work_history")
        .update(payload as Database["public"]["Tables"]["work_history"]["Update"])
        .eq("id", item.target_id)
        .eq("user_id", userId)
      if (error) throw new Error(error.message)
      return
    }

    case "project": {
      if (item.action === "create") {
        const name = String(payload.name ?? "")
        const slug =
          typeof payload.slug === "string" && payload.slug ? payload.slug : slugify(name)
        const { error } = await supabase.from("projects").insert({
          ...(payload as Record<string, unknown>),
          slug,
          user_id: userId,
        } as Database["public"]["Tables"]["projects"]["Insert"])
        if (error) throw new Error(error.message)
        return
      }
      if (!item.target_id) throw new Error("Missing target_id for project update/delete")
      if (item.action === "delete") {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", item.target_id)
          .eq("user_id", userId)
        if (error) throw new Error(error.message)
        return
      }
      const { error } = await supabase
        .from("projects")
        .update(payload as Database["public"]["Tables"]["projects"]["Update"])
        .eq("id", item.target_id)
        .eq("user_id", userId)
      if (error) throw new Error(error.message)
      return
    }

    case "skill": {
      if (item.action === "create") {
        const { error } = await supabase.from("skills").insert({
          ...(payload as Record<string, unknown>),
          user_id: userId,
        } as Database["public"]["Tables"]["skills"]["Insert"])
        if (error) throw new Error(error.message)
        return
      }
      if (!item.target_id) throw new Error("Missing target_id for skill update/delete")
      if (item.action === "delete") {
        const { error } = await supabase
          .from("skills")
          .delete()
          .eq("id", item.target_id)
          .eq("user_id", userId)
        if (error) throw new Error(error.message)
        return
      }
      const { error } = await supabase
        .from("skills")
        .update(payload as Database["public"]["Tables"]["skills"]["Update"])
        .eq("id", item.target_id)
        .eq("user_id", userId)
      if (error) throw new Error(error.message)
      return
    }

    case "resume":
      throw new Error("Resume generation isn't implemented yet (coming in Phase C).")

    case "github_readme":
      throw new Error("GitHub sync isn't implemented yet (coming in Phase E).")
  }
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return base || Math.random().toString(36).slice(2, 10)
}
