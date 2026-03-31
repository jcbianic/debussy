import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

export interface UsageEvent {
  ts: string
  event: 'skill' | 'agent' | 'session_start' | 'session_end'
  session: string
  name?: string
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
        const parsed = JSON.parse(line)
        if (parsed && parsed.ts && parsed.event && parsed.session) {
          events.push(parsed as UsageEvent)
        }
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
