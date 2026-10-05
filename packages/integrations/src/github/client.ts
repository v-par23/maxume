import { Octokit } from "@octokit/rest"

export function createGithubClient(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken })
}

export interface GithubReadme {
  /** The file's actual path/casing in the repo (e.g. "readme.md", not always "README.md"). */
  path: string
  content: string
  sha: string
}

/**
 * The special profile README lives at the repo root, but GitHub's own
 * "which file is the readme" matching is case-insensitive (readme.md,
 * Readme.md, README.md all count) while the Contents API path lookup is
 * case-sensitive — a literal `path: "README.md"` GET 404s against a repo
 * whose file is actually `readme.md`. List the root and match by name
 * instead, so an existing readme of any casing is found and updated in
 * place rather than silently duplicated alongside a new README.md.
 */
export async function getProfileReadme(
  octokit: Octokit,
  owner: string
): Promise<GithubReadme | null> {
  let rootEntries: Array<{ type: string; name: string; path: string; sha: string; download_url: string | null }>
  try {
    const { data } = await octokit.repos.getContent({ owner, repo: owner, path: "" })
    rootEntries = Array.isArray(data) ? data : [data]
  } catch (err) {
    if (isNotFoundError(err)) return null
    throw err
  }

  const readmeEntry = rootEntries.find(
    (entry) => entry.type === "file" && /^readme\.md$/i.test(entry.name)
  )
  if (!readmeEntry?.download_url) return null

  const response = await fetch(readmeEntry.download_url)
  if (!response.ok) return null

  return { path: readmeEntry.path, content: await response.text(), sha: readmeEntry.sha }
}

export async function profileRepoExists(octokit: Octokit, owner: string): Promise<boolean> {
  try {
    await octokit.repos.get({ owner, repo: owner })
    return true
  } catch (err) {
    if (isNotFoundError(err)) return false
    throw err
  }
}

/** GitHub only renders this repo on the profile page once it's public. */
export async function createProfileRepo(octokit: Octokit, owner: string): Promise<void> {
  await octokit.repos.createForAuthenticatedUser({
    name: owner,
    private: false,
    description: "Config files for my GitHub profile",
  })
}

export async function commitProfileReadme(
  octokit: Octokit,
  owner: string,
  path: string,
  content: string,
  sha: string | null,
  message: string
): Promise<void> {
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: owner,
    path,
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    sha: sha ?? undefined,
  })
}

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: unknown }).status === 404
  )
}
