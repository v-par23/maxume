import { NextResponse } from "next/server"
import { resolveRequestUser } from "@/lib/auth/resolve-request-user"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function GET(request: Request) {
  const requestUser = await resolveRequestUser(request)
  if (!requestUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  const supabase = createServiceRoleSupabaseClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("slug, full_name, portfolio_visibility")
    .eq("id", requestUser.userId)
    .single()

  return NextResponse.json({
    user_id: requestUser.userId,
    source: requestUser.source,
    slug: profile?.slug,
    full_name: profile?.full_name,
    portfolio_visibility: profile?.portfolio_visibility,
  })
}
