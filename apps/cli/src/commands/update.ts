import { checkbox, confirm } from "@inquirer/prompts"
import { api, ApiError } from "../lib/api-client"

const STATUS_TAG: Record<string, string> = {
  applied: "[ok]",
  failed: "[failed]",
  confirmed: "[confirmed]",
  rejected: "[skipped]",
}

export async function updateCommand(message: string, opts: { yes?: boolean }) {
  try {
    console.log("Thinking...")
    const result = await api.sendMessage(message)

    if (result.summary) console.log(`\n${result.summary}\n`)

    if (result.items.length === 0) {
      console.log("No changes were proposed.")
      return
    }

    let selectedIds: string[]
    if (opts.yes) {
      selectedIds = result.items.map((item) => item.id)
    } else {
      selectedIds = await checkbox({
        message: "Select changes to confirm:",
        choices: result.items.map((item) => ({
          name: `[${item.target}] ${item.diff_summary}`,
          value: item.id,
          checked: true,
        })),
      })
    }

    if (selectedIds.length === 0) {
      console.log("Nothing confirmed.")
      return
    }

    const confirmed = await api.confirmRun(result.run_id, selectedIds)
    if (confirmed.status !== "confirmed") {
      console.log(`Run status: ${confirmed.status}`)
      return
    }

    const proceed = opts.yes || (await confirm({ message: "Apply now?", default: true }))
    if (!proceed) {
      console.log("Not applied — you can apply later from the dashboard.")
      return
    }

    const applied = await api.applyRun(result.run_id)
    console.log(`\nRun ${applied.status}.`)
    for (const item of applied.items) {
      const tag = STATUS_TAG[item.status] ?? `[${item.status}]`
      console.log(`  ${tag} ${item.diff_summary}${item.error ? ` — ${item.error}` : ""}`)
    }
  } catch (err) {
    console.error(err instanceof ApiError ? err.message : err)
    process.exitCode = 1
  }
}
