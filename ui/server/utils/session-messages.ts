import { open as fsOpen } from 'node:fs/promises'
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
 * Resolve the JSONL file path for a CLI session.
 * Claude stores sessions in ~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl
 */
export function resolveSessionPath(
  repoRoot: string,
  sessionId: string
): string | null {
  const dirName = repoRoot.replace(/\//g, '-')
  return path.join(CLAUDE_PROJECTS, dirName, `${sessionId}.jsonl`)
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
