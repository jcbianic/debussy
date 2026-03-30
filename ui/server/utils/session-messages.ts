import { open as fsOpen, readdir, access, stat } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import path from 'node:path'
import os from 'node:os'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  tools?: { name: string; summary: string }[]
  timestamp: string
  model?: string
}

const CLAUDE_PROJECTS = path.join(os.homedir(), '.claude', 'projects')

/**
 * Find the JSONL file path for a session.
 * Searches across all project directories matching the repo root
 * (main repo + worktree variants).
 */
export async function findSessionPath(
  repoRoot: string,
  sessionId: string
): Promise<string | null> {
  const mainDirName = repoRoot.replace(/\//g, '-')
  const fileName = `${sessionId}.jsonl`

  let entries: string[]
  try {
    entries = await readdir(CLAUDE_PROJECTS)
  } catch {
    return null
  }

  // Check all project directories for this repo (main + worktrees)
  const matchingDirs = entries.filter(
    (e) => e === mainDirName || e.startsWith(mainDirName + '-')
  )

  for (const dir of matchingDirs) {
    const candidate = path.join(CLAUDE_PROJECTS, dir, fileName)
    try {
      await access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  return null
}

/**
 * Find a JSONL file by matching the first user prompt and approximate timestamp.
 * Used for dispatch sessions where the CLI sessionId differs from the dispatch ID.
 */
export async function findSessionByPrompt(
  repoRoot: string,
  prompt: string,
  startedAt: string,
  thresholdMs = 30_000
): Promise<string | null> {
  const mainDirName = repoRoot.replace(/\//g, '-')

  let entries: string[]
  try {
    entries = await readdir(CLAUDE_PROJECTS)
  } catch {
    return null
  }

  const matchingDirs = entries.filter(
    (e) => e === mainDirName || e.startsWith(mainDirName + '-')
  )

  const targetTime = new Date(startedAt).getTime()

  // Collect recent JSONL files (within ~5 min of the target)
  const candidates: { filePath: string; mtime: number }[] = []
  for (const dir of matchingDirs) {
    const dirPath = path.join(CLAUDE_PROJECTS, dir)
    try {
      const names = await readdir(dirPath)
      for (const name of names) {
        if (!name.endsWith('.jsonl')) continue
        const filePath = path.join(dirPath, name)
        const s = await stat(filePath)
        if (Math.abs(s.mtimeMs - targetTime) < 300_000) {
          candidates.push({ filePath, mtime: s.mtimeMs })
        }
      }
    } catch {
      continue
    }
  }

  // Sort by closest mtime to target
  candidates.sort(
    (a, b) => Math.abs(a.mtime - targetTime) - Math.abs(b.mtime - targetTime)
  )

  // Check first user prompt in each candidate
  for (const { filePath } of candidates.slice(0, 10)) {
    const firstPrompt = await extractFirstPrompt(filePath)
    if (!firstPrompt) continue
    const dt = Math.abs(new Date(firstPrompt.timestamp).getTime() - targetTime)
    if (dt < thresholdMs && firstPrompt.text === prompt) {
      return filePath
    }
  }

  return null
}

async function extractFirstPrompt(
  filePath: string
): Promise<{ text: string; timestamp: string } | null> {
  let handle: Awaited<ReturnType<typeof fsOpen>> | null = null
  try {
    handle = await fsOpen(filePath, 'r')
    const stream = handle.createReadStream({ encoding: 'utf8' })
    const rl = createInterface({ input: stream, crlfDelay: Infinity })

    let linesRead = 0
    for await (const line of rl) {
      linesRead++
      if (linesRead > 20) break
      try {
        const obj = JSON.parse(line)
        if (obj.type !== 'user' || obj.isMeta) continue
        const content = obj.message?.content
        if (typeof content !== 'string') continue
        const cleaned = stripSystemTags(content)
        if (cleaned) {
          rl.close()
          stream.destroy()
          return { text: cleaned, timestamp: obj.timestamp || '' }
        }
      } catch {
        continue
      }
    }

    rl.close()
    stream.destroy()
    return null
  } catch {
    return null
  } finally {
    await handle?.close()
  }
}

// Terminal message types that indicate a session has cleanly ended
const COMPLETED_TYPES = new Set([
  'last-prompt', // non-interactive session finished (dispatch, -p)
  'turn_duration', // turn ended, session idle (subtype of system)
  'stop_hook_summary', // session ended with stop hook (subtype of system)
])

// If the JSONL has no clean end marker but hasn't been written to
// in this many ms, consider the session inactive (e.g. Ctrl+C, terminal closed).
const INACTIVE_THRESHOLD_MS = 120_000 // 2 minutes

/**
 * Determine if a session is completed by reading the last line of the JSONL.
 * Uses two signals:
 *  1. A known terminal message type → definitely completed
 *  2. File not modified in >2 min → likely inactive (unclean exit)
 */
export async function isSessionCompleted(filePath: string): Promise<boolean> {
  let handle: Awaited<ReturnType<typeof fsOpen>> | null = null
  try {
    handle = await fsOpen(filePath, 'r')
    const fileStats = await handle.stat()
    const size = fileStats.size
    if (size === 0) return false

    // Read the last chunk (enough for the last line)
    const chunkSize = Math.min(size, 4096)
    const buffer = Buffer.alloc(chunkSize)
    await handle.read(buffer, 0, chunkSize, size - chunkSize)

    const tail = buffer.toString('utf8')
    const lines = tail.split('\n').filter(Boolean)
    const lastLine = lines[lines.length - 1]
    if (!lastLine) return false

    const obj = JSON.parse(lastLine)
    const type = obj.type as string
    const subtype = obj.subtype as string | undefined

    // Signal 1: clean end marker
    if (COMPLETED_TYPES.has(type) || COMPLETED_TYPES.has(subtype ?? '')) {
      return true
    }

    // Signal 2: file hasn't been touched recently → inactive session
    const age = Date.now() - fileStats.mtimeMs
    return age > INACTIVE_THRESHOLD_MS
  } catch {
    return false
  } finally {
    await handle?.close()
  }
}

/**
 * Parse a Claude CLI JSONL session file into chat messages.
 * Filters out meta messages, system messages, and file-history-snapshots.
 * Extracts user text, assistant text, and tool-use summaries.
 */
export async function parseSessionMessages(
  filePath: string
): Promise<ChatMessage[]> {
  let handle: Awaited<ReturnType<typeof fsOpen>> | null = null
  try {
    handle = await fsOpen(filePath, 'r')
    const stream = handle.createReadStream({ encoding: 'utf8' })
    const rl = createInterface({ input: stream, crlfDelay: Infinity })

    const messages: ChatMessage[] = []

    for await (const line of rl) {
      try {
        const obj = JSON.parse(line)
        const msg = parseJsonlLine(obj)
        if (msg) messages.push(msg)
      } catch {
        continue
      }
    }

    rl.close()
    stream.destroy()

    return messages
  } catch {
    return []
  } finally {
    await handle?.close()
  }
}

function parseJsonlLine(obj: Record<string, unknown>): ChatMessage | null {
  const type = obj.type as string
  if (type !== 'user' && type !== 'assistant') return null

  // Skip meta messages (system injections, command wrappers)
  if (obj.isMeta) return null

  const message = obj.message as Record<string, unknown> | undefined
  if (!message) return null

  const timestamp = (obj.timestamp as string) || ''
  const uuid = (obj.uuid as string) || ''
  const model = (message.model as string) || undefined

  if (type === 'user') {
    return parseUserMessage(message, uuid, timestamp)
  }

  if (type === 'assistant') {
    return parseAssistantMessage(message, uuid, timestamp, model)
  }

  return null
}

function parseUserMessage(
  message: Record<string, unknown>,
  uuid: string,
  timestamp: string
): ChatMessage | null {
  const content = message.content

  // String content = direct user text
  if (typeof content === 'string') {
    const cleaned = stripSystemTags(content)
    if (!cleaned) return null
    return { id: uuid, role: 'user', content: cleaned, timestamp }
  }

  // Array content = could be tool_result or text blocks
  if (Array.isArray(content)) {
    // Skip pure tool_result arrays (these are tool responses, not user messages)
    const hasToolResult = content.some(
      (b: Record<string, unknown>) => b.type === 'tool_result'
    )
    if (hasToolResult) return null

    // Extract text blocks
    const texts = content
      .filter((b: Record<string, unknown>) => b.type === 'text')
      .map((b: Record<string, unknown>) => stripSystemTags(b.text as string))
      .filter(Boolean)

    if (texts.length === 0) return null
    return { id: uuid, role: 'user', content: texts.join('\n'), timestamp }
  }

  return null
}

function parseAssistantMessage(
  message: Record<string, unknown>,
  uuid: string,
  timestamp: string,
  model?: string
): ChatMessage | null {
  const content = message.content
  if (!Array.isArray(content)) return null

  const textParts: string[] = []
  const tools: { name: string; summary: string }[] = []

  for (const block of content as Record<string, unknown>[]) {
    if (block.type === 'text') {
      const text = block.text as string
      if (text) textParts.push(text)
    } else if (block.type === 'tool_use') {
      const name = block.name as string
      const input = block.input as Record<string, unknown> | undefined
      tools.push({
        name,
        summary: summarizeToolInput(name, input),
      })
    }
    // Skip 'thinking' blocks — internal reasoning
  }

  // Skip messages that are only thinking with no visible output
  if (textParts.length === 0 && tools.length === 0) return null

  return {
    id: uuid,
    role: 'assistant',
    content: textParts.join('\n'),
    tools: tools.length > 0 ? tools : undefined,
    timestamp,
    model,
  }
}

function summarizeToolInput(
  name: string,
  input?: Record<string, unknown>
): string {
  if (!input) return ''

  switch (name) {
    case 'Read':
      return truncate(input.file_path as string, 80)
    case 'Write':
      return truncate(input.file_path as string, 80)
    case 'Edit':
      return truncate(input.file_path as string, 80)
    case 'Bash':
      return truncate(input.command as string, 100)
    case 'Grep':
      return truncate(`/${input.pattern}/ ${input.path || ''}`, 80)
    case 'Glob':
      return truncate(input.pattern as string, 80)
    case 'Skill':
      return truncate(input.skill as string, 80)
    case 'Agent':
      return truncate(input.description as string, 80)
    default:
      return ''
  }
}

function truncate(s: string | undefined | null, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max) + '…' : s
}

function stripSystemTags(s: string): string {
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
