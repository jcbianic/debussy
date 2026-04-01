import { listSessions, writeSession } from '../../../utils/dispatch-store'
import { listCliSessions } from '../../../utils/cli-sessions'
import { fetchLanes } from '../../../utils/lanes'
import { resolveRecordId } from '../../../utils/lane-store'
import {
  findSessionByPrompt,
  isSessionCompleted,
} from '../../../utils/session-messages'

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  // Resolve lane path and repo root
  let repoRoot = process.cwd()
  let lanePath = repoRoot
  const laneBranch = id
  try {
    const lanes = await fetchLanes()
    const rootLane = lanes.find((l) => l.checkedOutIn === 'root')
    if (rootLane) repoRoot = rootLane.path
    const lane = lanes.find((l) => l.id === id)
    if (lane && lane.checkedOutIn) {
      lanePath = lane.path
    }
  } catch {
    // fallback to cwd
  }

  const recordId = await resolveRecordId(id)

  // Fetch both sources in parallel
  const [dispatchSessions, cliSessions] = await Promise.all([
    listSessions(recordId),
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
