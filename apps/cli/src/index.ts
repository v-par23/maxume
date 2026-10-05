#!/usr/bin/env node
import { Command } from "commander"
import { loginCommand } from "./commands/login"
import { statusCommand } from "./commands/status"
import { updateCommand } from "./commands/update"
import { resumeCommand } from "./commands/resume"

const program = new Command()

program
  .name("maxume")
  .description(
    "Tell the agent what changed; it keeps your resume, portfolio, and GitHub in sync."
  )
  .version("0.1.0")

program.command("login").description("Save your CLI token").action(loginCommand)

program.command("status").description("Show who you're signed in as").action(statusCommand)

program
  .command("update <message>")
  .description("Tell the agent something changed")
  .option("-y, --yes", "Confirm and apply all proposed changes without prompting")
  .action((message: string, opts: { yes?: boolean }) => updateCommand(message, opts))

program
  .command("resume")
  .description("Download a generated resume")
  .option("-o, --output <path>", "Where to save the PDF")
  .action((opts: { output?: string }) => resumeCommand(opts))

program.parseAsync()
