import { NextResponse } from "next/server"
import { resolveRequestUser } from "@/lib/auth/resolve-request-user"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestUser = await resolveRequestUser(request)
  if (!requestUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceRoleSupabaseClient()

  const { data: resume } = await supabase
    .from("resume_versions")
    .select("id, user_id, pdf_storage_path, version_number")
    .eq("id", id)
    .single()

  if (!resume || resume.user_id !== requestUser.userId) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 })
  }

  const { data: signed, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.pdf_storage_path, 60, {
      download: `resume-v${resume.version_number}.pdf`,
    })

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to sign download URL." },
      { status: 500 }
    )
  }

  return NextResponse.redirect(signed.signedUrl)
}
