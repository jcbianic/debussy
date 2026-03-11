import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { homedir } from 'os'

interface Session {
  id: string
  timestamp: string
  lastModified: string
  gitBranch?: string
  firstPrompt?: string
  summary?: string
  messageCount: number
  size: number
}

function parseSession(filePath: string): Session | null {
  try {
    const stat = statSync(filePath)
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(Boolean)

    let sessionId = ''
    let timestamp = ''
    let gitBranch = ''
    let firstPrompt = ''
    let summary = ''
    let messageCount = 0

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)

        // Grab session metadata from first user message
        if (entry.type === 'user' && entry.sessionId) {
          sessionId = sessionId || entry.sessionId
          timestamp = timestamp || entry.timestamp
          gitBranch = gitBranch || entry.gitBranch

          if (!entry.isMeta && !firstPrompt) {
            const content = entry.message?.content
            if (typeof content === 'string' && !content.startsWith('<')) {
              firstPrompt = content.slice(0, 200)
            }
          }
          messageCount++
        }

        // Grab summary if present
        if (entry.type === 'summary' && entry.summary) {
          summary = entry.summary.slice(0, 200)
        }
      } catch {
        // skip malformed lines
      }
    }

    if (!sessionId) return null

    return {
      id: sessionId,
      timestamp,
      lastModified: stat.mtime.toISOString(),
      gitBranch: gitBranch || undefined,
      firstPrompt: firstPrompt || undefined,
      summary: summary || undefined,
      messageCount,
      size: stat.size,
    }
  } catch {
    return null
  }
}

export default defineEventHandler(async () => {
  const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')
  // Claude Code stores sessions in ~/.claude/projects/<encoded-path>/
  const encodedPath = projectRoot.replace(/\//g, '-')
  const sessionsDir = join(homedir(), '.claude', 'projects', encodedPath)

  if (!existsSync(sessionsDir)) {
    return { dir: sessionsDir, sessions: [], error: 'No sessions found for this project' }
  }

  const files = readdirSync(sessionsDir).filter((f) => f.endsWith('.jsonl'))
  const sessions: Session[] = []

  for (const file of files) {
    const session = parseSession(join(sessionsDir, file))
    if (session) sessions.push(session)
  }

  // Sort by last modified, newest first
  sessions.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

  return { dir: sessionsDir, sessions }
})
