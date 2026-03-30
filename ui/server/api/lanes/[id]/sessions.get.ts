import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { listSessions, writeSession } from '../../../utils/dispatch-store'
import { listCliSessions } from '../../../utils/cli-sessions'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import {
  findSessionByPrompt,
  isSessionCompleted,
} from '../../../utils/session-messages'
import type { Lane } from '../../../utils/lanes'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  // Resolve lane path and repo root from worktrees
  // The first worktree is always the main repo root
  let repoRoot = process.cwd()
  let lanePath = repoRoot
  let laneBranch: string | undefined
  try {
    const { stdout } = await execFileAsync('git', [
      'worktree',
      'list',
      '--porcelain',
    ])
    const lanes = parseLanesFromWorktrees(stdout, process.cwd())
    // First lane (root) gives us the repo root
    if (lanes.length > 0) repoRoot = lanes[0]!.path
    const lane = lanes.find((l: Lane) => l.id === id)
    if (lane) {
      lanePath = lane.path
      laneBranch = lane.branch
    }
  } catch {
    // fallback to cwd
  }

  // Fetch both sources in parallel
  const [dispatchSessions, cliSessions] = await Promise.all([
    listSessions(id),
    listCliSessions(repoRoot, lanePath, laneBranch),
  ])

  // Fix stale "running" dispatch sessions by checking the actual JSONL
  for (const s of dispatchSessions) {
    if (s.status !== 'running') continue
    const jsonlPath = await findSessionByPrompt(repoRoot, s.prompt, s.startedAt)
    if (jsonlPath && (await isSessionCompleted(jsonlPath))) {
      s.status = 'completed'
      s.completedAt = new Date().toISOString()
      await writeSession(s)
    }
  }

  // Normalize dispatch sessions to include source field
  const normalized = dispatchSessions.map((s) => ({
    ...s,
    source: 'dispatch' as const,
  }))

  // Deduplicate: dispatch sessions also appear as CLI sessions.
  // They have different IDs, but same prompt and close timestamps.
  // Prefer the dispatch entry (richer metadata: exit code, elapsed, output).
  const dedupedCli = cliSessions.filter((cli) => {
    return !normalized.some((d) => {
      if (d.prompt !== cli.prompt) return false
      const dt = Math.abs(
        new Date(d.startedAt).getTime() - new Date(cli.startedAt).getTime()
      )
      return dt < 30_000 // within 30 seconds
    })
  })

  // Merge and sort by startedAt (most recent first)
  const all = [...normalized, ...dedupedCli].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

  return all
})
