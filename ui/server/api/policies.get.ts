import { readdir, readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'

interface PolicySection {
  title: string
  items?: { rule: string; note?: string }[]
  content?: string[]
}

function parseSections(content: string): PolicySection[] {
  return content
    .split(/^## /m)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.trim().split('\n')
      const title = (lines[0] ?? '').trim()
      const body = lines.slice(1).join('\n').trim()

      // Detect bullet-list sections as items
      const bulletLines = body.split('\n').filter((l) => /^- /.test(l.trim()))
      if (bulletLines.length > 0) {
        const items = bulletLines.map((line) => {
          const cleaned = line.replace(/^-\s+/, '').trim()
          // Split on ` — ` or ` -- ` for rule/note
          const sep = cleaned.match(/ — | -- /)
          if (sep && sep.index !== undefined) {
            return {
              rule: cleaned.slice(0, sep.index).replace(/\*\*/g, ''),
              note: cleaned.slice(sep.index + sep[0].length),
            }
          }
          return { rule: cleaned.replace(/\*\*/g, '') }
        })
        // Also grab any non-bullet paragraphs as content
        const paragraphs = body
          .split('\n')
          .filter((l) => !/^- /.test(l.trim()) && l.trim())
          .join('\n')
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
        return {
          title,
          items,
          ...(paragraphs.length > 0 ? { content: paragraphs } : {}),
        }
      }

      // Plain paragraphs
      const paragraphs = body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      return { title, content: paragraphs }
    })
}

export default defineEventHandler(async () => {
  const policiesPath = await resolveDebussyPath('.debussy', 'policies')

  let files: string[]
  try {
    files = (await readdir(policiesPath)).filter((f) => f.endsWith('.md'))
  } catch {
    return []
  }

  const topics = (
    await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(policiesPath, file), 'utf8')
        const { data, content } = matter(raw)
        if (!data.name || !data.icon) {
          console.warn(`[debussy] policies/${file}: missing name or icon`)
          return null
        }
        const key = file.replace('.md', '')
        return {
          key,
          name: data.name as string,
          description:
            content
              .trim()
              .split('\n')[0]
              ?.replace(/^## .*/, '')
              .trim() || '',
          file: `.debussy/policies/${file}`,
          icon: data.icon as string,
          status: (data.status as string) || 'draft',
          order: (data.order as number) ?? 99,
          sections: parseSections(content),
        }
      })
    )
  ).filter(Boolean)

  return topics.sort((a, b) => a!.order - b!.order)
})
