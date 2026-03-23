import { readFile } from 'node:fs/promises'
import { resolveDebussyPath } from '../../utils/debussy'
import { parsePrinciples } from '../../utils/architecture'

export default defineEventHandler(async () => {
  const filePath = await resolveDebussyPath(
    'docs',
    'architecture',
    'principles.md'
  )
  try {
    const raw = await readFile(filePath, 'utf8')
    return parsePrinciples(raw)
  } catch {
    return []
  }
})
