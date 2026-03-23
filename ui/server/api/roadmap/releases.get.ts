import { readFile } from 'node:fs/promises'
import { resolveDebussyPath } from '../../utils/debussy'
import { parseReleases } from '../../utils/roadmap'

export default defineEventHandler(async () => {
  const filePath = await resolveDebussyPath('specs', 'intents.md')
  try {
    const raw = await readFile(filePath, 'utf8')
    return parseReleases(raw)
  } catch {
    return []
  }
})
