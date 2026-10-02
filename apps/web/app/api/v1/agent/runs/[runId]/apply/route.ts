import { NextResponse } from "next/server"
import { applyChangeSet } from "@maxume/integrations"
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
  const supabase = createServiceRoleSupabaseClient()

  const { data: run } = await supabase.from("agent_runs").select("*").eq("id", runId).single()
  if (!run || run.user_id !== requestUser.userId) {
    return NextResponse.json({ error: "Agent run not found." }, { status: 404 })
  }
  if (run.status !== "confirmed") {
    return NextResponse.json(
      { error: `Run is not ready to apply (status: ${run.status}).` },
      { status: 400 }
    )
  }

  try {
    await applyChangeSet(supabase, runId)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  const [{ data: finalRun }, { data: items }] = await Promise.all([
    supabase.from("agent_runs").select("*").eq("id", runId).single(),
    supabase
      .from("change_set_items")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
  ])

  return NextResponse.json({ run_id: runId, status: finalRun?.status, items: items ?? [] })
}
