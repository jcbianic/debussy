import { readFile } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async () => {
  const root = await resolveDebussyPath()
  let name = 'debussy'
  let repoUrl = ''
  try {
    const pkg = JSON.parse(
      await readFile(path.join(root, 'package.json'), 'utf8')
    )
    if (typeof pkg.name === 'string' && pkg.name) name = pkg.name
    const repo = pkg.repository
    if (typeof repo === 'string') repoUrl = repo
    else if (typeof repo?.url === 'string') repoUrl = repo.url
  } catch {
    // package.json missing or unreadable — use defaults
  }
  return { name, path: root, repoUrl }
})
