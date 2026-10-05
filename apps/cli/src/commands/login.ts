import { input, password } from "@inquirer/prompts"
import { writeConfig, configPath } from "../lib/config"
import { api, ApiError } from "../lib/api-client"

export async function loginCommand() {
  const apiUrlRaw = await input({
    message: "Maxume API URL",
    default: process.env.MAXUME_API_URL ?? "http://localhost:3000",
  })
  const token = await password({
    message: "CLI token (Settings -> CLI tokens in the dashboard)",
  })

  // Write first so the whoami check below (which reads config from disk)
  // can use it; still safe since we report and the user can re-run login
  // if it turns out to be invalid.
  await writeConfig({ apiUrl: apiUrlRaw.replace(/\/$/, ""), token })

  try {
    const me = await api.me()
    console.log(`Logged in as ${me.full_name || me.slug || me.user_id}.`)
    console.log(`Config saved to ${configPath()}`)
  } catch (err) {
    console.error(`Login failed: ${err instanceof ApiError ? err.message : err}`)
    process.exitCode = 1
  }
}
