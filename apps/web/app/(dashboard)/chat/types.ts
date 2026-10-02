export type ChangeSetItem = {
  id: string
  target: string
  action: string
  diff_summary: string
  status: string
  error: string | null
}

export type RunStatus =
  | "proposed"
  | "confirmed"
  | "applying"
  | "applied"
  | "partially_applied"
  | "rejected"
  | "failed"
