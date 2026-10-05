import { writeFile } from "node:fs/promises"
import { readConfig } from "./config"

export class ApiError extends Error {}

export interface ChangeSetItem {
  id: string
  target: string
  action: string
  diff_summary: string
  status: string
  error: string | null
}

export interface ResumeVersion {
  id: string
  version_number: number
  template_id: string
  is_active: boolean
  created_at: string
}

async function requireConfig() {
  const config = await readConfig()
  if (!config) {
    throw new ApiError("Not logged in. Run `maxume login` first.")
  }
  return config
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const config = await requireConfig()
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.error ?? `Request failed with status ${res.status}`)
  }
  return body as T
}

export const api = {
  me: () =>
    request<{
      user_id: string
      slug?: string
      full_name?: string
      portfolio_visibility?: string
    }>("/api/v1/me"),

  sendMessage: (message: string) =>
    request<{ run_id: string; summary: string; items: ChangeSetItem[] }>(
      "/api/v1/agent/message",
      { method: "POST", body: JSON.stringify({ message }) }
    ),

  confirmRun: (runId: string, itemIds: string[]) =>
    request<{ run_id: string; status: string; items: ChangeSetItem[] }>(
      `/api/v1/agent/runs/${runId}/confirm`,
      { method: "POST", body: JSON.stringify({ item_ids: itemIds }) }
    ),

  applyRun: (runId: string) =>
    request<{ run_id: string; status: string; items: ChangeSetItem[] }>(
      `/api/v1/agent/runs/${runId}/apply`,
      { method: "POST" }
    ),

  listResumes: () => request<{ resumes: ResumeVersion[] }>("/api/v1/resumes"),
}

export async function downloadResume(resumeId: string, destPath: string): Promise<void> {
  const config = await requireConfig()
  const res = await fetch(`${config.apiUrl}/api/v1/resumes/${resumeId}/download`, {
    headers: { Authorization: `Bearer ${config.token}` },
  })
  if (!res.ok) {
    throw new ApiError(`Download failed with status ${res.status}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(destPath, buffer)
}
