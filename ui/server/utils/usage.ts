import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

export interface UsageEvent {
  ts: string
  event: 'skill' | 'agent' | 'session_start' | 'session_end'
  session: string
  name?: string
}

const VALID_EVENTS = new Set<string>([
  'skill',
  'agent',
  'session_start',
  'session_end',
])

function parseUsageEvent(raw: unknown): UsageEvent | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>
  const ts = obj['ts']
  const event = obj['event']
  const session = obj['session']
  if (typeof ts !== 'string' || !ts) return null
  if (typeof event !== 'string' || !VALID_EVENTS.has(event)) return null
  if (typeof session !== 'string' || !session) return null
  const name = obj['name']
  return {
    ts,
    event: event as UsageEvent['event'],
    session,
    ...(typeof name === 'string' && name ? { name } : {}),
  }
}

/**
 * Reads all .jsonl files under the given usage directory.
 * Skips malformed lines silently.
 */
export async function readUsageData(usageDir: string): Promise<UsageEvent[]> {
  let files: string[]
  try {
    files = await readdir(usageDir)
  } catch {
    return []
  }

  const jsonlFiles = files.filter((f) => f.endsWith('.jsonl')).sort()

  const events: UsageEvent[] = []

  for (const file of jsonlFiles) {
    let content: string
    try {
      content = await readFile(path.join(usageDir, file), 'utf8')
    } catch {
      continue
    }
    for (const line of content.split('\n')) {
      if (!line.trim()) continue
      try {
        const event = parseUsageEvent(JSON.parse(line))
        if (event) events.push(event)
      } catch {
        // skip malformed lines
      }
    }
  }

  return events
}

/**
 * Counts skill invocations grouped by skill name.
 */
export function countBySkill(events: UsageEvent[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of events) {
    if (e.event === 'skill' && e.name) {
      counts[e.name] = (counts[e.name] ?? 0) + 1
    }
  }
  return counts
}

/**
 * Counts agent invocations grouped by agent type.
 */
export function countByAgent(events: UsageEvent[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of events) {
    if (e.event === 'agent' && e.name) {
      counts[e.name] = (counts[e.name] ?? 0) + 1
    }
  }
  return counts
}
