import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

// Supabase's free tier auto-pauses a project after ~7 days with no API/DB
// activity, which otherwise silently breaks sign-in and every agent call
// until someone notices and manually restores it from the dashboard. Vercel
// Cron hits this daily — well inside that window — with a trivial read to
// keep the project counted as active, no human babysitting required.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceRoleSupabaseClient()
  const { error } = await supabase.from("profiles").select("id").limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() })
}
