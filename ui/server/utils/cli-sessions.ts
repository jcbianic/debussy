import { readdir, stat } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { open as fsOpen } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { isSessionCompleted } from './session-messages'

export interface CliSession {
  sessionId: string
  source: 'cli'
  branch: string
  cwd: string
  startedAt: string
  lastActivity: string
  model: string
  prompt: string
  slug: string
  status: 'running' | 'completed'
}

const CLAUDE_PROJECTS = path.join(os.homedir(), '.claude', 'projects')

/**
 * List CLI sessions matching a given working directory.
 * Scans ~/.claude/projects/ for JSONL session files,
 * reads metadata from the first few lines, and filters by cwd.
 */
export async function listCliSessions(
  repoRoot: string,
  matchCwd: string,
  matchBranch?: string,
  limit = 30
): Promise<CliSession[]> {
  // Claude names project dirs by replacing / with -
  const mainDirName = repoRoot.replace(/\//g, '-')

  let entries: string[]
  try {
    entries = await readdir(CLAUDE_PROJECTS)
  } catch {
    return []
  }

  // Find all project directories for this repo (main + worktrees)
  const matchingDirs = entries.filter(
    (e) => e === mainDirName || e.startsWith(mainDirName + '-')
  )

  // Collect JSONL files with mtime, sorted most recent first
  const files: { filePath: string; mtime: number }[] = []
  for (const dir of matchingDirs) {
    const dirPath = path.join(CLAUDE_PROJECTS, dir)
    try {
      const names = await readdir(dirPath)
      for (const name of names) {
        if (!name.endsWith('.jsonl')) continue
        const filePath = path.join(dirPath, name)
        const s = await stat(filePath)
        files.push({ filePath, mtime: s.mtimeMs })
      }
    } catch {
      continue
    }
  }

  files.sort((a, b) => b.mtime - a.mtime)

  // Parse metadata from the most recent files
  const sessions: CliSession[] = []
  for (const { filePath } of files.slice(0, limit * 2)) {
    const session = await parseFirstMessages(filePath)
    if (!session) continue
    const cwdMatch = session.cwd === matchCwd
    const branchMatch = matchBranch ? session.branch === matchBranch : false
    if (!cwdMatch && !branchMatch) continue
    sessions.push(session)
    if (sessions.length >= limit) break
  }

  return sessions
}

async function parseFirstMessages(
  filePath: string
): Promise<CliSession | null> {
  let handle: Awaited<ReturnType<typeof fsOpen>> | null = null
  try {
    handle = await fsOpen(filePath, 'r')
    const stream = handle.createReadStream({ encoding: 'utf8' })
    const rl = createInterface({ input: stream, crlfDelay: Infinity })

    let sessionId = ''
    let branch = ''
    let cwd = ''
    let startedAt = ''
    let model = ''
    let prompt = ''
    let slug = ''
    let lastTimestamp = ''
    let linesRead = 0

    for await (const line of rl) {
      linesRead++
      if (linesRead > 15) break // metadata is always in the first few lines

      try {
        const obj = JSON.parse(line)

        // Grab common fields from any message
        if (obj.sessionId && !sessionId) sessionId = obj.sessionId
        if (obj.gitBranch && !branch) branch = obj.gitBranch
        if (obj.cwd && !cwd) cwd = obj.cwd
        if (obj.slug && !slug) slug = obj.slug
        if (obj.timestamp) lastTimestamp = obj.timestamp

        // First user message → extract prompt and start time
        if (obj.type === 'user' && !startedAt) {
          startedAt = obj.timestamp || ''
          const content = obj.message?.content
          if (typeof content === 'string') {
            prompt = stripTags(content).slice(0, 200) || ''
          }
        }

        // First assistant message → extract model
        if (obj.type === 'assistant' && obj.message?.model && !model) {
          model = obj.message.model
        }
      } catch {
        continue
      }
    }

    rl.close()
    stream.destroy()

    if (!sessionId || !cwd) return null

    const completed = await isSessionCompleted(filePath)

    return {
      sessionId,
      source: 'cli',
      branch,
      cwd,
      startedAt,
      lastActivity: lastTimestamp || startedAt,
      model: friendlyModel(model),
      prompt: prompt || slug || '(interactive session)',
      slug,
      status: completed ? 'completed' : 'running',
    }
  } catch {
    return null
  } finally {
    await handle?.close()
  }
}

function stripTags(s: string): string {
  // Remove XML/HTML tags and their content for system/caveat wrappers
  return s
    .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/g, '')
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<command-message>[\s\S]*?<\/command-message>/g, '')
    .replace(/<command-name>[\s\S]*?<\/command-name>/g, '')
    .replace(/<command-args>[\s\S]*?<\/command-args>/g, '')
    .replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/Caveat:.*$/m, '')
    .trim()
}

function friendlyModel(model: string): string {
  if (model.includes('opus')) return 'opus'
  if (model.includes('sonnet')) return 'sonnet'
  if (model.includes('haiku')) return 'haiku'
  return model || 'unknown'
}
