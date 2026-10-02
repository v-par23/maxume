import Anthropic from "@anthropic-ai/sdk"
import { PROPOSE_TOOL_SCHEMAS, type ChangeSetItemDraft, type ProposeToolName } from "@maxume/schemas"
import { buildToolDefinitions } from "./tools"
import { toChangeSetItemDraft } from "./change-set-mapping"

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

const DEFAULT_MODEL = "claude-sonnet-5"
const MAX_TURNS = 6

const SYSTEM_PROMPT = `You are Maxume's career-update agent. The user tells you, in natural language, something that changed about their career (a promotion, a new job, a shipped project, a new skill, etc). Your job is to translate that into precise proposed changes using the propose_* tools.

Rules:
- Only use the propose_* tools to record changes — they do not apply anything themselves, a human reviews and confirms every change before it takes effect.
- Make one tool call per distinct change. Don't bundle unrelated changes into one call.
- Use the provided current profile/jobs/projects/skills as ground truth for IDs and existing values — never invent an id.
- If the user's message implies a resume or GitHub README should reflect the change, propose that too (propose_resume_regeneration / propose_github_readme_sync), but only when it's a substantive change (a new job, ended job, or new flagship project) — not for minor wording tweaks.
- Give each tool call a short, specific "reason".
- When you are done proposing changes, write one short final message (not a tool call) summarizing what you proposed, for the user to review.`

export async function runAgentLoop(args: {
  apiKey: string
  model?: string
  message: string
  context: ProfileContext
}): Promise<AgentLoopResult> {
  const { apiKey, message, context } = args
  const model = args.model ?? DEFAULT_MODEL
  const client = new Anthropic({ apiKey })
  const tools = buildToolDefinitions()

  const proposedItems: ChangeSetItemDraft[] = []
  let assistantSummary = ""

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Current profile context (JSON):\n${JSON.stringify(context, null, 2)}\n\nUser update: ${message}`,
    },
  ]

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    })

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    )
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    )

    if (textBlocks.length > 0) {
      assistantSummary = textBlocks.map((b) => b.text).join("\n")
    }

    if (toolUseBlocks.length === 0) {
      break
    }

    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => {
      const toolName = block.name as ProposeToolName
      const schema = PROPOSE_TOOL_SCHEMAS[toolName]

      if (!schema) {
        return {
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown tool: ${block.name}`,
        }
      }

      const parsed = schema.safeParse(block.input)
      if (!parsed.success) {
        return {
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `Invalid input: ${parsed.error.message}`,
        }
      }

      const draft = toChangeSetItemDraft(toolName, parsed.data)
      proposedItems.push(draft)
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: `Recorded: ${draft.diff_summary}`,
      }
    })

    messages.push({ role: "user", content: toolResults })
  }

  return { assistantSummary, proposedItems, model }
}
