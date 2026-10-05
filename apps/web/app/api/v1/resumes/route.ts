import { NextResponse } from "next/server"
import { resolveRequestUser } from "@/lib/auth/resolve-request-user"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function GET(request: Request) {
  const requestUser = await resolveRequestUser(request)
  if (!requestUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  const supabase = createServiceRoleSupabaseClient()
  const { data, error } = await supabase
    .from("resume_versions")
    .select("id, version_number, template_id, is_active, created_at")
    .eq("user_id", requestUser.userId)
    .order("version_number", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resumes: data ?? [] })
}
