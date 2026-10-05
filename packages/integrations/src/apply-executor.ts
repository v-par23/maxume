import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@maxume/db"
import { renderResumePdf } from "@maxume/resume-renderer"
import type { ResumeData } from "@maxume/resume-templates"
import {
  createGithubClient,
  getProfileReadme,
  profileRepoExists,
  createProfileRepo,
  commitProfileReadme,
  mergeReadmeSections,
} from "./github"

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
      await applyItem(supabase, run.user_id, runId, item)
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
  runId: string,
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

    case "resume": {
      const templateId =
        typeof payload.template_id === "string" ? payload.template_id : "classic"
      const data = await buildResumeSnapshot(supabase, userId)
      const pdfBuffer = await renderResumePdf(templateId, data)

      const { data: lastVersion } = await supabase
        .from("resume_versions")
        .select("version_number")
        .eq("user_id", userId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle()
      const versionNumber = (lastVersion?.version_number ?? 0) + 1
      const storagePath = `${userId}/${versionNumber}.pdf`

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: false })
      if (uploadError) throw new Error(uploadError.message)

      await supabase
        .from("resume_versions")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("is_active", true)

      const { error: insertError } = await supabase.from("resume_versions").insert({
        user_id: userId,
        version_number: versionNumber,
        template_id: templateId,
        data_snapshot: data as unknown as Database["public"]["Tables"]["resume_versions"]["Insert"]["data_snapshot"],
        pdf_storage_path: storagePath,
        is_active: true,
        generated_by_run_id: runId,
      })
      if (insertError) throw new Error(insertError.message)
      return
    }

    case "github_readme": {
      const { data: rows } = await supabase.rpc("get_decrypted_connected_account_token", {
        p_user_id: userId,
        p_provider: "github",
      })
      const account = rows?.[0]
      if (!account) {
        throw new Error("GitHub is not connected. Connect it in Settings → Integrations.")
      }

      const sections = (payload.sections ?? {}) as Record<string, string>
      const owner = account.provider_username
      const octokit = createGithubClient(account.access_token)

      // Custom repo targeting (payload.repo) isn't implemented yet — v1 only
      // syncs the special profile README repo ({owner}/{owner}).
      if (!(await profileRepoExists(octokit, owner))) {
        await createProfileRepo(octokit, owner)
      }

      const existing = await getProfileReadme(octokit, owner)
      const merged = mergeReadmeSections(existing?.content ?? null, sections, owner)
      await commitProfileReadme(
        octokit,
        owner,
        existing?.path ?? "README.md",
        merged,
        existing?.sha ?? null,
        "Update profile README via Maxume"
      )
      return
    }
  }
}

/** Freezes the user's current profile/jobs/projects/skills into resume-ready shape. */
async function buildResumeSnapshot(supabase: ServiceClient, userId: string): Promise<ResumeData> {
  const [{ data: profile }, { data: jobs }, { data: projects }, { data: skills }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("work_history")
        .select("*")
        .eq("user_id", userId)
        .order("display_order", { ascending: true }),
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("display_order", { ascending: true }),
      supabase.from("skills").select("*").eq("user_id", userId),
    ])

  if (!profile) throw new Error(`Profile not found for user ${userId}`)

  return {
    full_name: profile.full_name,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    contact_email: profile.contact_email,
    jobs: (jobs ?? []).map((job) => ({
      company: job.company,
      title: job.title,
      location: job.location,
      start_date: job.start_date,
      end_date: job.end_date,
      is_current: job.is_current,
      description: job.description,
      highlights: job.highlights,
    })),
    projects: (projects ?? []).map((project) => ({
      name: project.name,
      summary: project.summary,
      description: project.description,
      tech_stack: project.tech_stack,
      highlights: project.highlights,
      links: project.links as { repo_url?: string; live_url?: string } | null,
    })),
    skills: (skills ?? []).map((skill) => ({ name: skill.name, category: skill.category })),
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
