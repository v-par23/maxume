import { api, ApiError } from "../lib/api-client"

export async function statusCommand() {
  try {
    const me = await api.me()
    console.log(`Signed in as ${me.full_name || me.slug || me.user_id}`)
    if (me.slug) console.log(`Slug: ${me.slug}`)
    if (me.portfolio_visibility) console.log(`Portfolio: ${me.portfolio_visibility}`)
  } catch (err) {
    console.error(err instanceof ApiError ? err.message : err)
    process.exitCode = 1
  }
}
