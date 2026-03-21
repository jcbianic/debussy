import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const ORDER = ['vision', 'landscape', 'product', 'audiences', 'problems']

function parseSections(content: string) {
  return content
    .split(/^## /m)
    .filter(block => block.trim())
    .map((block) => {
      const lines = block.trim().split('\n')
      const title = (lines[0] ?? '').trim()
      const body = lines.slice(1).join('\n').trim()
      const paragraphs = body.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
      return { title, content: paragraphs }
    })
}

export default defineEventHandler(async () => {
  const docsPath = path.resolve(process.cwd(), '..', 'docs', 'strategy')
  const files = (await readdir(docsPath)).filter(f => f.endsWith('.md'))

  const artifacts = (
    await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(docsPath, file), 'utf8')
        const { data, content } = matter(raw)
        if (!data.name) return null
        const key = file.replace('.md', '')
        return {
          key,
          name: data.name as string,
          file: `docs/strategy/${file}`,
          icon: data.icon as string,
          status: data.status as 'reviewed' | 'draft',
          sections: parseSections(content),
        }
      }),
    )
  ).filter(Boolean)

  return artifacts.sort((a, b) => ORDER.indexOf(a!.key) - ORDER.indexOf(b!.key))
})
