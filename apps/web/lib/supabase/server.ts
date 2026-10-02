import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@maxume/db"

/** Use inside Server Components, Route Handlers, and Server Actions. */
export async function getServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerSupabaseClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options)
        }
      } catch {
        // Called from a Server Component — a middleware/proxy refreshing the
        // session handles cookie writes in that case, so this is safe to ignore.
      }
    },
  })
}
