import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

const STATE_COOKIE = "gh_oauth_state"

function redirectToIntegrations(request: Request, params: Record<string, string>) {
  const url = new URL("/settings/integrations", request.url)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = NextResponse.redirect(url)
  response.cookies.delete(STATE_COOKIE)
  return response
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const oauthError = url.searchParams.get("error")

  const cookieStore = await cookies()
  const savedState = cookieStore.get(STATE_COOKIE)?.value

  if (oauthError) {
    return redirectToIntegrations(request, { error: oauthError })
  }
  if (!code || !state || !savedState || state !== savedState) {
    return redirectToIntegrations(request, { error: "invalid_state" })
  }

  const supabase = await getServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirectToIntegrations(request, { error: "not_signed_in" })
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return redirectToIntegrations(request, { error: "not_configured" })
  }

  const redirectUri = new URL("/api/v1/connected-accounts/github/callback", request.url)
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri.toString(),
    }),
  })
  const tokenJson = await tokenResponse.json()
  if (!tokenResponse.ok || !tokenJson.access_token) {
    return redirectToIntegrations(request, {
      error: tokenJson.error_description ?? "token_exchange_failed",
    })
  }

  const accessToken: string = tokenJson.access_token
  const scopes: string[] = typeof tokenJson.scope === "string" ? tokenJson.scope.split(",") : []

  const ghUserResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "maxume" },
  })
  if (!ghUserResponse.ok) {
    return redirectToIntegrations(request, { error: "github_user_fetch_failed" })
  }
  const ghUser = await ghUserResponse.json()

  const serviceClient = createServiceRoleSupabaseClient()
  const { error } = await serviceClient.rpc("set_connected_account_token", {
    p_user_id: user.id,
    p_provider: "github",
    p_provider_user_id: String(ghUser.id),
    p_provider_username: ghUser.login,
    p_access_token: accessToken,
    p_scopes: scopes,
  })
  if (error) {
    return redirectToIntegrations(request, { error: error.message })
  }

  return redirectToIntegrations(request, { connected: "1" })
}
