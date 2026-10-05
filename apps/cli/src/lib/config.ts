import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

const CONFIG_DIR = join(homedir(), ".config", "maxume")
const CONFIG_PATH = join(CONFIG_DIR, "config.json")

export interface CliConfig {
  apiUrl: string
  token: string
}

export async function readConfig(): Promise<CliConfig | null> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8")
    return JSON.parse(raw) as CliConfig
  } catch {
    return null
  }
}

export async function writeConfig(config: CliConfig): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 })
}

export function configPath(): string {
  return CONFIG_PATH
}
