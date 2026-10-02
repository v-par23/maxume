export const CHANGE_SET_TARGETS = [
  "profile",
  "job",
  "project",
  "skill",
  "resume",
  "github_readme",
] as const
export type ChangeSetTarget = (typeof CHANGE_SET_TARGETS)[number]

export const CHANGE_SET_ACTIONS = ["create", "update", "delete"] as const
export type ChangeSetAction = (typeof CHANGE_SET_ACTIONS)[number]

export const CHANGE_SET_ITEM_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "applying",
  "applied",
  "failed",
] as const
export type ChangeSetItemStatus = (typeof CHANGE_SET_ITEM_STATUSES)[number]

export const AGENT_RUN_STATUSES = [
  "proposed",
  "confirmed",
  "applying",
  "applied",
  "partially_applied",
  "rejected",
  "failed",
  "expired",
] as const
export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number]

/** What a propose_* tool call produces, before it has a DB id. */
export interface ChangeSetItemDraft {
  target: ChangeSetTarget
  action: ChangeSetAction
  target_id?: string | null
  payload: Record<string, unknown>
  diff_summary: string
}
