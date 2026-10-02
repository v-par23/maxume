import { z } from "zod"

// Every propose_* tool carries `reason`: a short human-readable justification
// the model gives for the change, surfaced in the diff review UI so the user
// isn't just confirming raw field edits blind.

export const ProposeProfileUpdateInput = z
  .object({
    fields: z
      .object({
        full_name: z.string().min(1).optional(),
        headline: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
      })
      .refine((obj) => Object.keys(obj).length > 0, {
        message: "At least one field must be provided",
      }),
    reason: z.string().min(1),
  })
  .strict()

export const ProposeJobUpdateInput = z
  .object({
    job_id: z.string().uuid().optional(),
    action: z.enum(["create", "update", "end_current"]),
    company: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().nullable().optional(),
    is_current: z.boolean().optional(),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    reason: z.string().min(1),
  })
  .strict()

export const ProposeProjectUpdateInput = z
  .object({
    project_id: z.string().uuid().optional(),
    action: z.enum(["create", "update", "delete"]),
    name: z.string().optional(),
    slug: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    tech_stack: z.array(z.string()).optional(),
    links: z
      .object({
        repo_url: z.string().url().optional(),
        live_url: z.string().url().optional(),
      })
      .optional(),
    highlights: z.array(z.string()).optional(),
    is_current: z.boolean().optional(),
    reason: z.string().min(1),
  })
  .strict()

export const ProposeSkillUpdateInput = z
  .object({
    action: z.enum(["add", "remove", "update"]),
    skill_id: z.string().uuid().optional(),
    name: z.string().optional(),
    category: z
      .enum(["language", "framework", "tool", "platform", "soft_skill", "other"])
      .optional(),
    reason: z.string().min(1),
  })
  .strict()

export const ProposeResumeRegenerationInput = z
  .object({
    template_id: z.string().optional(),
    reason: z.string().min(1),
  })
  .strict()

export const ProposeGithubReadmeSyncInput = z
  .object({
    repo: z.string().optional(),
    sections: z.record(z.string(), z.string()),
    reason: z.string().min(1),
  })
  .strict()

export const PROPOSE_TOOL_SCHEMAS = {
  propose_profile_update: ProposeProfileUpdateInput,
  propose_job_update: ProposeJobUpdateInput,
  propose_project_update: ProposeProjectUpdateInput,
  propose_skill_update: ProposeSkillUpdateInput,
  propose_resume_regeneration: ProposeResumeRegenerationInput,
  propose_github_readme_sync: ProposeGithubReadmeSyncInput,
} as const

export type ProposeToolName = keyof typeof PROPOSE_TOOL_SCHEMAS

export type ProposeProfileUpdateInput = z.infer<typeof ProposeProfileUpdateInput>
export type ProposeJobUpdateInput = z.infer<typeof ProposeJobUpdateInput>
export type ProposeProjectUpdateInput = z.infer<typeof ProposeProjectUpdateInput>
export type ProposeSkillUpdateInput = z.infer<typeof ProposeSkillUpdateInput>
export type ProposeResumeRegenerationInput = z.infer<typeof ProposeResumeRegenerationInput>
export type ProposeGithubReadmeSyncInput = z.infer<typeof ProposeGithubReadmeSyncInput>
