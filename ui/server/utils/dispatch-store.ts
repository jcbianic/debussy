import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from './debussy'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DispatchSession {
  sessionId: string
  laneId: string
  prompt: string
  model: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt: string | null
  elapsed: string | null
  output: string | null
  error: string | null
  exitCode: number | null
  killed: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sessionsDir(laneId: string): Promise<string> {
  const dir = await resolveDebussyPath('.debussy', 'lanes', laneId, 'sessions')
  await mkdir(dir, { recursive: true })
  return dir
}

// ─── CRUD ───────────────────────────────────────────────────────────────────

export async function writeSession(session: DispatchSession): Promise<void> {
  const dir = await sessionsDir(session.laneId)
  const filePath = path.join(dir, `${session.sessionId}.json`)
  const tmpPath = filePath + '.tmp'
  await writeFile(tmpPath, JSON.stringify(session, null, 2) + '\n', 'utf8')
  await rename(tmpPath, filePath)
}

export async function readSession(
  laneId: string,
  sessionId: string
): Promise<DispatchSession | null> {
  const dir = await sessionsDir(laneId)
  try {
    const raw = await readFile(path.join(dir, `${sessionId}.json`), 'utf8')
    return JSON.parse(raw) as DispatchSession
  } catch {
    return null
  }
}

export async function listSessions(laneId: string): Promise<DispatchSession[]> {
  const dir = await sessionsDir(laneId)
  let entries: string[]
  try {
    const dirents = await readdir(dir)
    entries = dirents.filter((f) => f.endsWith('.json') && !f.endsWith('.tmp'))
  } catch {
    return []
  }

  const sessions: DispatchSession[] = []
  for (const entry of entries) {
    try {
      const raw = await readFile(path.join(dir, entry), 'utf8')
      sessions.push(JSON.parse(raw) as DispatchSession)
    } catch {
      // skip corrupt files
    }
  }

  // Most recent first
  sessions.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )
  return sessions
}
