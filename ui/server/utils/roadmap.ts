import matter from 'gray-matter'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Intent {
  id: string
  title: string
  addresses: string
  state: 'done' | 'in-progress' | 'open' | 'out-of-scope'
  lane?: string
  laneId?: string
  issue?: number
  priority?: string
  description?: string
  doneWhen?: string
}

export interface Release {
  id: string
  name: string
  theme: string
  intents: Intent[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseField(section: string, field: string): string | undefined {
  const match = section.match(new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`))
  return match ? match[1]!.trim() : undefined
}

// ─── parseReleases ────────────────────────────────────────────────────────────

export function parseReleases(raw: string): Release[] {
  if (!raw.trim()) return []

  const { content } = matter(raw)

  const sections = content.split(/\n(?=## )/).filter((s) => s.trim())

  const releaseMap = new Map<string, Release>()
  const releaseOrder: string[] = []

  for (const section of sections) {
    const lines = section.split('\n')

    const headingLine = lines.find((l) => l.startsWith('## '))
    if (!headingLine) continue

    // Extract title from "## N — Title" or "## — Title" heading
    const headingText = headingLine.replace(/^## /, '').trim()
    const dashIdx = headingText.indexOf(' — ')
    let title: string
    if (dashIdx >= 0) {
      title = headingText.slice(dashIdx + 3).trim()
    } else if (headingText.startsWith('— ')) {
      title = headingText.slice(2).trim()
    } else {
      title = headingText
    }

    const releaseId = parseField(section, 'release')
    if (!releaseId) {
      console.warn(
        `[debussy] intents.md: section "${title}" missing **release:** field — skipped`
      )
      continue
    }

    const releaseName = parseField(section, 'releaseName') ?? releaseId
    const releaseTheme = parseField(section, 'releaseTheme') ?? ''

    if (!releaseMap.has(releaseId)) {
      releaseMap.set(releaseId, {
        id: releaseId,
        name: releaseName,
        theme: releaseTheme,
        intents: [],
      })
      releaseOrder.push(releaseId)
    }

    const id = parseField(section, 'id') ?? '—'
    const addresses = parseField(section, 'addresses') ?? ''

    const stateRaw = parseField(section, 'state') ?? 'open'
    const VALID_STATES = ['done', 'in-progress', 'open', 'out-of-scope']
    const state = (
      VALID_STATES.includes(stateRaw) ? stateRaw : 'open'
    ) as Intent['state']

    const priority = parseField(section, 'priority')
    const issueRaw = parseField(section, 'issue')
    const issueNum = issueRaw ? parseInt(issueRaw, 10) : NaN
    const issue = !isNaN(issueNum) ? issueNum : undefined

    const lane = parseField(section, 'lane')
    const laneId = parseField(section, 'laneId')
    const doneWhen = parseField(section, 'doneWhen')

    // Description: non-empty lines that aren't headings, bold fields, or HR
    const descLines = lines.filter(
      (l) =>
        l !== headingLine &&
        !l.match(/^\*\*\w+:\*\*/) &&
        l.trim() !== '---' &&
        l.trim() !== ''
    )
    const description = descLines.join(' ').trim() || undefined

    const intent: Intent = {
      id,
      title,
      addresses,
      state,
      ...(priority !== undefined && { priority }),
      ...(issue !== undefined && { issue }),
      ...(lane !== undefined && { lane }),
      ...(laneId !== undefined && { laneId }),
      ...(doneWhen !== undefined && { doneWhen }),
      ...(description !== undefined && { description }),
    }

    releaseMap.get(releaseId)!.intents.push(intent)
  }

  return releaseOrder.map((id) => releaseMap.get(id)!)
}
