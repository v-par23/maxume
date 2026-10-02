import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same network-boundary role).
// This refreshes the Supabase session cookie on every request and gates the
// dashboard behind auth — the standard @supabase/ssr proxy/middleware pattern.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")

  if (!user && isDashboardRoute) {
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|u/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
