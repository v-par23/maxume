import { zodToJsonSchema } from "zod-to-json-schema"
import { PROPOSE_TOOL_SCHEMAS, type ProposeToolName } from "@maxume/schemas"
import type Anthropic from "@anthropic-ai/sdk"

const TOOL_DESCRIPTIONS: Record<ProposeToolName, string> = {
  propose_profile_update:
    "Propose an update to the user's top-level profile fields (full name, headline, bio, location). Does not apply anything — only records a proposed change for human review.",
  propose_job_update:
    "Propose creating, updating, or ending a work-history entry. Use action:'end_current' to mark a current job as ended (sets is_current:false and end_date). Does not apply anything — only records a proposed change for human review.",
  propose_project_update:
    "Propose creating, updating, or deleting a portfolio project. Does not apply anything — only records a proposed change for human review.",
  propose_skill_update:
    "Propose adding, removing, or updating a skill. Does not apply anything — only records a proposed change for human review.",
  propose_resume_regeneration:
    "Propose regenerating the user's resume PDF from their current profile data (jobs, projects, skills). Does not carry resume content itself — it is rendered from the database at apply time, after any other confirmed changes in this run. Does not apply anything — only records a proposed change for human review.",
  propose_github_readme_sync:
    "Propose updating the user's GitHub profile README with new section content (e.g. current role, a pinned project). Does not apply anything — only records a proposed change for human review.",
}

export function buildToolDefinitions(): Anthropic.Tool[] {
  return (Object.keys(PROPOSE_TOOL_SCHEMAS) as ProposeToolName[]).map((name) => {
    const jsonSchema = zodToJsonSchema(PROPOSE_TOOL_SCHEMAS[name], {
      $refStrategy: "none",
      target: "jsonSchema7",
    })
    // zodToJsonSchema includes a top-level $schema key Anthropic doesn't need.
    const { $schema: _drop, ...inputSchema } = jsonSchema as Record<string, unknown>

    return {
      name,
      description: TOOL_DESCRIPTIONS[name],
      input_schema: inputSchema,
    } as Anthropic.Tool
  })
}
