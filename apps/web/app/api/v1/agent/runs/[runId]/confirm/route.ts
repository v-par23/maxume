import { NextResponse } from "next/server"
import { resolveRequestUser } from "@/lib/auth/resolve-request-user"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const requestUser = await resolveRequestUser(request)
  if (!requestUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  const { runId } = await params
  const body = await request.json().catch(() => null)
  const itemIds = Array.isArray(body?.item_ids) ? body.item_ids.filter((id: unknown) => typeof id === "string") : []

  const supabase = createServiceRoleSupabaseClient()

  const { data: run } = await supabase.from("agent_runs").select("*").eq("id", runId).single()
  if (!run || run.user_id !== requestUser.userId) {
    return NextResponse.json({ error: "Agent run not found." }, { status: 404 })
  }
  if (run.status !== "proposed") {
    return NextResponse.json(
      { error: `Run is not awaiting confirmation (status: ${run.status}).` },
      { status: 400 }
    )
  }

  const { data: pendingItems } = await supabase
    .from("change_set_items")
    .select("id")
    .eq("run_id", runId)
    .eq("status", "pending")

  const pendingIds = (pendingItems ?? []).map((i) => i.id)
  const toConfirm = itemIds.filter((id: string) => pendingIds.includes(id))
  const toReject = pendingIds.filter((id) => !toConfirm.includes(id))

  if (toConfirm.length > 0) {
    await supabase.from("change_set_items").update({ status: "confirmed" }).in("id", toConfirm)
  }
  if (toReject.length > 0) {
    await supabase.from("change_set_items").update({ status: "rejected" }).in("id", toReject)
  }

  const nextRunStatus = toConfirm.length > 0 ? "confirmed" : "rejected"
  await supabase
    .from("agent_runs")
    .update({ status: nextRunStatus, confirmed_at: new Date().toISOString() })
    .eq("id", runId)

  const { data: items } = await supabase
    .from("change_set_items")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true })

  return NextResponse.json({ run_id: runId, status: nextRunStatus, items: items ?? [] })
}
