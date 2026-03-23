import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from '../../utils/debussy'
import { parseAdrs } from '../../utils/architecture'

export default defineEventHandler(async () => {
  const decisionsDir = await resolveDebussyPath('docs', 'decisions')
  try {
    const entries = await readdir(decisionsDir)
    const mdFiles = entries.filter((f) => f.endsWith('.md'))
    const files: Record<string, string> = {}
    await Promise.all(
      mdFiles.map(async (filename) => {
        const content = await readFile(
          path.join(decisionsDir, filename),
          'utf8'
        )
        files[filename] = content
      })
    )
    return parseAdrs(files)
  } catch {
    return []
  }
})
