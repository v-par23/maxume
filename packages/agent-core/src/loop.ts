import { generateText, stepCountIs, tool, type LanguageModel } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { PROPOSE_TOOL_SCHEMAS, type ChangeSetItemDraft, type ProposeToolName } from "@maxume/schemas"
import { TOOL_DESCRIPTIONS } from "./tools"
import { toChangeSetItemDraft } from "./change-set-mapping"

export type LlmProvider = "anthropic" | "openai"

export interface ProfileContext {
  profile: Record<string, unknown>
  jobs: Record<string, unknown>[]
  projects: Record<string, unknown>[]
  skills: Record<string, unknown>[]
}

export interface AgentLoopResult {
  assistantSummary: string
  proposedItems: ChangeSetItemDraft[]
  model: string
}

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  anthropic: "claude-sonnet-5",
  openai: "gpt-5",
}

const MAX_STEPS = 6

const SYSTEM_PROMPT = `You are Maxume's career-update agent. The user tells you, in natural language, something that changed about their career (a promotion, a new job, a shipped project, a new skill, etc). Your job is to translate that into precise proposed changes using the propose_* tools.

Rules:
- Only use the propose_* tools to record changes — they do not apply anything themselves, a human reviews and confirms every change before it takes effect.
- Make one tool call per distinct change. Don't bundle unrelated changes into one call.
- Use the provided current profile/jobs/projects/skills as ground truth for IDs and existing values — never invent an id.
- If the user's message implies a resume or GitHub README should reflect the change, propose that too (propose_resume_regeneration / propose_github_readme_sync), but only when it's a substantive change (a new job, ended job, or new flagship project) — not for minor wording tweaks.
- Give each tool call a short, specific "reason".
- When you are done proposing changes, write one short final message (not a tool call) summarizing what you proposed, for the user to review.`

function resolveModel(provider: LlmProvider, apiKey: string, modelId: string): LanguageModel {
  if (provider === "openai") {
    return createOpenAI({ apiKey })(modelId)
  }
  return createAnthropic({ apiKey })(modelId)
}

export async function runAgentLoop(args: {
  provider: LlmProvider
  apiKey: string
  model?: string
  message: string
  context: ProfileContext
}): Promise<AgentLoopResult> {
  const { provider, apiKey, message, context } = args
  const modelId = args.model ?? DEFAULT_MODELS[provider]
  const model = resolveModel(provider, apiKey, modelId)

  const proposedItems: ChangeSetItemDraft[] = []

  const tools = Object.fromEntries(
    (Object.keys(PROPOSE_TOOL_SCHEMAS) as ProposeToolName[]).map((name) => [
      name,
      tool({
        description: TOOL_DESCRIPTIONS[name],
        inputSchema: PROPOSE_TOOL_SCHEMAS[name],
        execute: async (input: Record<string, unknown>) => {
          const draft = toChangeSetItemDraft(name, input)
          proposedItems.push(draft)
          return { recorded: draft.diff_summary }
        },
      }),
    ])
  )

  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Current profile context (JSON):\n${JSON.stringify(context, null, 2)}\n\nUser update: ${message}`,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),
  })

  return { assistantSummary: result.text, proposedItems, model: modelId }
}
