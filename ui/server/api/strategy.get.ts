import { readdir, readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'

const ORDER = ['vision', 'landscape', 'product', 'audiences', 'problems']

function parseSections(content: string) {
  return content
    .split(/^## /m)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.trim().split('\n')
      const title = (lines[0] ?? '').trim()
      const body = lines.slice(1).join('\n').trim()
      const paragraphs = body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      return { title, content: paragraphs }
    })
}

export default defineEventHandler(async () => {
  const strategyPath = await resolveStrategyPath()

  let files: string[]
  try {
    files = (await readdir(strategyPath)).filter((f) => f.endsWith('.md'))
  } catch {
    // .debussy/strategy/ doesn't exist yet — normal on a fresh clone
    return []
  }

  const artifacts = (
    await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(strategyPath, file), 'utf8')
        const { data, content } = matter(raw)
        if (!validateArtifactFrontmatter(data, file)) return null
        const key = file.replace('.md', '')
        return {
          key,
          name: data.name,
          file: `.debussy/strategy/${file}`,
          icon: data.icon,
          status: data.status,
          sections: parseSections(content),
        }
      })
    )
  ).filter(Boolean)

  return artifacts.sort((a, b) => ORDER.indexOf(a!.key) - ORDER.indexOf(b!.key))
})
