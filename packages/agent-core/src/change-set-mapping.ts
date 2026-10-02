import type { ChangeSetItemDraft, ChangeSetTarget, ProposeToolName } from "@maxume/schemas"

function summarizeProfile(input: {
  fields: Record<string, string | undefined>
}): string {
  const parts = Object.entries(input.fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k} → "${v}"`)
  return `Update profile: ${parts.join(", ")}`
}

function summarizeJob(input: {
  action: "create" | "update" | "end_current"
  title?: string
  company?: string
  job_id?: string
}): string {
  if (input.action === "create") return `Add job: ${input.title ?? "?"} at ${input.company ?? "?"}`
  if (input.action === "end_current") return `Mark current job as ended`
  return `Update job: ${input.title ?? input.company ?? input.job_id}`
}

function summarizeProject(input: {
  action: "create" | "update" | "delete"
  name?: string
  project_id?: string
}): string {
  if (input.action === "create") return `Add project: ${input.name ?? "?"}`
  if (input.action === "delete") return `Delete project: ${input.name ?? input.project_id}`
  return `Update project: ${input.name ?? input.project_id}`
}

function summarizeSkill(input: {
  action: "add" | "remove" | "update"
  name?: string
  skill_id?: string
}): string {
  if (input.action === "add") return `Add skill: ${input.name ?? "?"}`
  if (input.action === "remove") return `Remove skill: ${input.name ?? input.skill_id}`
  return `Update skill: ${input.name ?? input.skill_id}`
}

function summarizeResume(input: { template_id?: string }): string {
  return `Regenerate resume${input.template_id ? ` (template: ${input.template_id})` : ""}`
}

function summarizeGithubReadme(input: { repo?: string; sections: Record<string, string> }): string {
  const sections = Object.keys(input.sections).join(", ")
  return `Update GitHub README${input.repo ? ` (${input.repo})` : ""}: ${sections}`
}

/**
 * Maps a validated propose_* tool call to a change_set_items draft row.
 * This is the ONLY place tool-call shape becomes a DB target/action — keep it
 * in sync with packages/schemas/src/propose-tools.ts and the DB check constraints.
 */
export function toChangeSetItemDraft(
  toolName: ProposeToolName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any
): ChangeSetItemDraft {
  switch (toolName) {
    case "propose_profile_update":
      return {
        target: "profile",
        action: "update",
        payload: input.fields,
        diff_summary: summarizeProfile(input),
      }
    case "propose_job_update": {
      const basePayload = stripControlFields(input, ["job_id", "action", "reason"])
      // "end_current" is a semantic shorthand — the model isn't required to spell
      // out is_current/end_date itself, so synthesize them if missing.
      const payload =
        input.action === "end_current"
          ? {
              ...basePayload,
              is_current: false,
              end_date: input.end_date ?? new Date().toISOString().slice(0, 10),
            }
          : basePayload
      return {
        target: "job",
        action: input.action === "create" ? "create" : "update",
        target_id: input.job_id ?? null,
        payload,
        diff_summary: summarizeJob(input),
      }
    }
    case "propose_project_update":
      return {
        target: "project" as ChangeSetTarget,
        action: input.action,
        target_id: input.project_id ?? null,
        payload: stripControlFields(input, ["project_id", "action", "reason"]),
        diff_summary: summarizeProject(input),
      }
    case "propose_skill_update":
      return {
        target: "skill",
        action: input.action === "add" ? "create" : input.action === "remove" ? "delete" : "update",
        target_id: input.skill_id ?? null,
        payload: stripControlFields(input, ["skill_id", "action", "reason"]),
        diff_summary: summarizeSkill(input),
      }
    case "propose_resume_regeneration":
      return {
        target: "resume",
        action: "create",
        payload: { template_id: input.template_id ?? "classic" },
        diff_summary: summarizeResume(input),
      }
    case "propose_github_readme_sync":
      return {
        target: "github_readme",
        action: "update",
        payload: stripControlFields(input, ["reason"]),
        diff_summary: summarizeGithubReadme(input),
      }
  }
}

function stripControlFields<T extends Record<string, unknown>>(
  input: T,
  keys: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(input)) {
    if (!keys.includes(k) && v !== undefined) out[k] = v
  }
  return out
}
