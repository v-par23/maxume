import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase/server"

const STATE_COOKIE = "gh_oauth_state"

export async function GET(request: Request) {
  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured on this server." },
      { status: 500 }
    )
  }

  const state = randomBytes(16).toString("hex")
  const redirectUri = new URL("/api/v1/connected-accounts/github/callback", request.url)

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize")
  authorizeUrl.searchParams.set("client_id", clientId)
  authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString())
  authorizeUrl.searchParams.set("scope", "public_repo")
  authorizeUrl.searchParams.set("state", state)

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })
  return response
}
