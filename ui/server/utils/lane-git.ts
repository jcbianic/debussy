import { exec, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolveDebussyPath } from './debussy'

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

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

export interface IssueSummary {
  number: number
  title: string
  labels: string[]
}

export async function fetchOpenIssues(): Promise<IssueSummary[]> {
  const { stdout } = await execAsync(
    'gh issue list --state open --json number,title,labels --limit 100'
  )
  const data = JSON.parse(stdout) as Array<{
    number: number
    title: string
    labels: { name: string }[]
  }>
  return data.map((d) => ({
    number: d.number,
    title: d.title,
    labels: d.labels.map((l) => l.name),
  }))
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

export async function pullBranch(lanePath: string): Promise<void> {
  await execAsync(`git -C "${lanePath}" pull`)
}

export async function checkoutBranch(
  lanePath: string,
  branch: string
): Promise<void> {
  await execAsync(`git -C "${lanePath}" checkout "${branch}"`)
}

export function parseIssueNumberFromBranch(branch: string): number | null {
  const match = branch.match(/^feature\/(\d+)-/)
  return match ? parseInt(match[1]!, 10) : null
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
  // Use execFile to avoid shell interpretation of backticks/special chars
  const { stdout } = await execFileAsync('gh', [
    'pr',
    'create',
    '--head',
    branch,
    '--draft',
    '--title',
    title,
    '--body',
    body,
  ])
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

// ─── Initial commit ─────────────────────────────────────────────────────────

export async function initialCommit(
  worktreePath: string,
  scopeContent: string
): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises')
  const path = await import('node:path')
  const scopeDir = path.join(worktreePath, '.debussy')
  await mkdir(scopeDir, { recursive: true })
  await writeFile(path.join(scopeDir, 'scope.md'), scopeContent, 'utf8')
  await execAsync(`git -C "${worktreePath}" add .debussy/scope.md`)
  await execAsync(`git -C "${worktreePath}" commit -m "chore: initialize lane"`)
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
