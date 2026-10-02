import { NextResponse } from "next/server"
import { runAgentLoop, type ProfileContext } from "@maxume/agent-core"
import type { Database } from "@maxume/db"
import { resolveRequestUser } from "@/lib/auth/resolve-request-user"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

const MODEL = "claude-sonnet-5"

export async function POST(request: Request) {
  const requestUser = await resolveRequestUser(request)
  if (!requestUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()
  const { userId, source } = requestUser

  const { data: apiKey } = await supabase.rpc("get_decrypted_llm_api_key", {
    p_user_id: userId,
    p_provider: "anthropic",
  })
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Anthropic API key saved yet. Add one in Settings → API key." },
      { status: 400 }
    )
  }

  const [{ data: profile }, { data: jobs }, { data: projects }, { data: skills }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("work_history").select("*").eq("user_id", userId).order("display_order"),
      supabase.from("projects").select("*").eq("user_id", userId).order("display_order"),
      supabase.from("skills").select("*").eq("user_id", userId),
    ])

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 })
  }

  const context: ProfileContext = {
    profile,
    jobs: jobs ?? [],
    projects: projects ?? [],
    skills: skills ?? [],
  }

  const { data: run, error: runInsertError } = await supabase
    .from("agent_runs")
    .insert({ user_id: userId, source, input_message: message, llm_model: MODEL })
    .select("*")
    .single()

  if (runInsertError || !run) {
    return NextResponse.json(
      { error: runInsertError?.message ?? "Failed to create agent run." },
      { status: 500 }
    )
  }

  try {
    const result = await runAgentLoop({ apiKey, model: MODEL, message, context })

    const itemsToInsert: Database["public"]["Tables"]["change_set_items"]["Insert"][] =
      result.proposedItems.map((item) => ({
        run_id: run.id,
        target: item.target,
        action: item.action,
        target_id: item.target_id ?? null,
        payload: item.payload as Database["public"]["Tables"]["change_set_items"]["Insert"]["payload"],
        diff_summary: item.diff_summary,
      }))

    const { data: insertedItems, error: itemsError } =
      itemsToInsert.length > 0
        ? await supabase.from("change_set_items").insert(itemsToInsert).select("*")
        : { data: [], error: null }

    if (itemsError) throw new Error(itemsError.message)

    await supabase
      .from("agent_runs")
      .update({ assistant_summary: result.assistantSummary })
      .eq("id", run.id)

    return NextResponse.json({
      run_id: run.id,
      summary: result.assistantSummary,
      items: insertedItems ?? [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase.from("agent_runs").update({ status: "failed" }).eq("id", run.id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
