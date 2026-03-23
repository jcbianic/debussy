import matter from 'gray-matter'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Principle {
  num: string
  name: string
  description: string
  relatedAdrs?: string[]
}

export interface AdrSection {
  title: string
  content: string[]
}

export interface Adr {
  key: string
  id: string
  shortTitle: string
  title: string
  status: string
  date: string
  issue?: string
  issueLabel?: string
  supersedes?: string
  affectedPrinciples?: string[]
  sections: AdrSection[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseH2Sections(content: string): AdrSection[] {
  return content
    .split(/\n(?=## )/)
    .filter((block) => block.includes('\n## ') || block.startsWith('## '))
    .map((block) => {
      const lines = block.split('\n')
      const heading = lines.find((l) => l.startsWith('## '))
      if (!heading) return null
      const title = heading.replace(/^## /, '').trim()
      const body = lines
        .slice(lines.indexOf(heading) + 1)
        .join('\n')
        .trim()
      const paragraphs = body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      return { title, content: paragraphs }
    })
    .filter((s): s is AdrSection => s !== null)
}

// ─── parsePrinciples ─────────────────────────────────────────────────────────

export function parsePrinciples(raw: string): Principle[] {
  if (!raw.trim()) return []

  const { content } = matter(raw)

  // Split on H2 headings — each principle is an H2 section
  const sections = content.split(/\n(?=## )/).filter((s) => s.trim())

  const result: Principle[] = []

  for (const section of sections) {
    const lines = section.split('\n')

    const headingLine = lines.find((l) => l.startsWith('## '))
    if (!headingLine) continue

    // Extract name from "## N — Name" heading
    const headingText = headingLine.replace(/^## /, '').trim()
    const dashIdx = headingText.indexOf(' — ')
    const name =
      dashIdx >= 0 ? headingText.slice(dashIdx + 3).trim() : headingText

    // num must appear as a bold field
    const numMatch = section.match(/\*\*num:\*\*\s*(\S+)/)
    if (!numMatch) {
      console.warn(
        `[debussy] principles.md: section "${name}" missing **num:** field — skipped`
      )
      continue
    }
    const num = numMatch[1]!

    // relatedAdrs bold field (optional)
    const adrMatch = section.match(/\*\*relatedAdrs:\*\*\s*(.+)/)
    const relatedAdrs = adrMatch
      ? adrMatch[1]!
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    // Description: non-empty lines that aren't headings, bold fields, or HR
    const descLines = lines.filter(
      (l) =>
        l !== headingLine &&
        !l.match(/^\*\*\w+:\*\*/) &&
        l.trim() !== '---' &&
        l.trim() !== ''
    )
    const description = descLines.join(' ').trim()

    result.push({ num, name, description, relatedAdrs })
  }

  return result
}

// ─── parseAdrs ───────────────────────────────────────────────────────────────

export function parseAdrs(files: Record<string, string>): Adr[] {
  const result: Adr[] = []

  for (const [filename, raw] of Object.entries(files)) {
    const { data, content } = matter(raw)

    if (typeof data.id !== 'string' || !data.id) {
      console.warn(`[debussy] ${filename}: missing frontmatter id — skipped`)
      continue
    }

    const key = `adr-${data.id}`

    // Title from H1 heading
    const h1Match = content.match(/^# (.+)$/m)
    const title = h1Match ? h1Match[1]!.trim() : filename.replace('.md', '')

    const sections = parseH2Sections(content)

    result.push({
      key,
      id: String(data.id),
      shortTitle: typeof data.shortTitle === 'string' ? data.shortTitle : '',
      title,
      status: typeof data.status === 'string' ? data.status : '',
      date: data.date != null ? String(data.date) : '',
      issue: typeof data.issue === 'string' ? data.issue : undefined,
      issueLabel:
        typeof data.issueLabel === 'string' ? data.issueLabel : undefined,
      supersedes:
        typeof data.supersedes === 'string' ? data.supersedes : undefined,
      affectedPrinciples: Array.isArray(data.affectedPrinciples)
        ? data.affectedPrinciples.map(String)
        : undefined,
      sections,
    })
  }

  return result.sort((a, b) => a.id.localeCompare(b.id))
}
