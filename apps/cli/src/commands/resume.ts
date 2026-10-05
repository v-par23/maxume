import { select } from "@inquirer/prompts"
import { api, downloadResume, ApiError } from "../lib/api-client"

export async function resumeCommand(opts: { output?: string }) {
  try {
    const { resumes } = await api.listResumes()
    if (resumes.length === 0) {
      console.log("No resume generated yet — ask the agent to regenerate it.")
      return
    }

    let chosen = resumes.find((r) => r.is_active) ?? resumes[0]
    if (resumes.length > 1) {
      const id = await select({
        message: "Which version?",
        choices: resumes.map((r) => ({
          name: `v${r.version_number}${r.is_active ? " (active)" : ""} — ${r.template_id}`,
          value: r.id,
        })),
        default: chosen.id,
      })
      chosen = resumes.find((r) => r.id === id) ?? chosen
    }

    const dest = opts.output ?? `resume-v${chosen.version_number}.pdf`
    await downloadResume(chosen.id, dest)
    console.log(`Saved to ${dest}`)
  } catch (err) {
    console.error(err instanceof ApiError ? err.message : err)
    process.exitCode = 1
  }
}
