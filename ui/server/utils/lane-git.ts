import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { resolveDebussyPath } from './debussy'

const execAsync = promisify(exec)

// ─── GitHub Issue ────────────────────────────────────────────────────────────

export interface IssueData {
  title: string
  body: string
  labels: string[]
}

export async function fetchIssue(num: number): Promise<IssueData> {
  const { stdout } = await execAsync(
    `gh issue view ${num} --json title,body,labels`
  )
  const data = JSON.parse(stdout)
  return {
    title: data.title ?? '',
    body: data.body ?? '',
    labels: (data.labels ?? []).map((l: { name: string }) => l.name),
  }
}

// ─── Branch ──────────────────────────────────────────────────────────────────

export async function createBranch(
  name: string,
  base: string = 'main'
): Promise<void> {
  await execAsync(`git branch "${name}" "${base}"`)
}

export async function deleteBranch(name: string): Promise<void> {
  await execAsync(`git branch -d "${name}"`)
}

export async function pushBranch(branch: string): Promise<void> {
  await execAsync(`git push -u origin "${branch}"`)
}

// ─── Worktree ────────────────────────────────────────────────────────────────

export async function createWorktree(
  relativePath: string,
  branch: string
): Promise<string> {
  const root = await resolveDebussyPath()
  const absPath = `${root}/${relativePath}`
  await execAsync(`git worktree add "${absPath}" "${branch}"`)
  return absPath
}

export async function removeWorktree(absolutePath: string): Promise<void> {
  await execAsync(`git worktree remove "${absolutePath}" --force`)
}

// ─── Pull Request ────────────────────────────────────────────────────────────

export async function createDraftPR(
  branch: string,
  title: string,
  body: string
): Promise<number> {
  // Push first so the remote branch exists
  await pushBranch(branch)
  const { stdout } = await execAsync(
    `gh pr create --head "${branch}" --draft --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`
  )
  // gh pr create prints the PR URL; extract the number
  const match = stdout.trim().match(/\/pull\/(\d+)/)
  if (!match) throw new Error(`Could not parse PR number from: ${stdout}`)
  return parseInt(match[1]!, 10)
}

export async function markPRReady(prNum: number): Promise<void> {
  await execAsync(`gh pr ready ${prNum}`)
}

export async function mergePR(prNum: number): Promise<void> {
  await execAsync(`gh pr merge ${prNum} --squash --delete-branch`)
}

export async function closePR(prNum: number): Promise<void> {
  await execAsync(`gh pr close ${prNum}`)
}

// ─── Working tree status ─────────────────────────────────────────────────────

export async function isCleanWorktree(absolutePath: string): Promise<boolean> {
  const { stdout } = await execAsync(
    `git -C "${absolutePath}" status --porcelain`
  )
  return stdout.trim() === ''
}

// ─── Slug ────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}
