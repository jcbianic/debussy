import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import type { Commit, Lane } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  let stdout = ''
  try {
    const result = await execAsync('git worktree list --porcelain')
    stdout = result.stdout
  } catch {
    return []
  }

  const lanes = parseLanesFromWorktrees(stdout, process.cwd())
  const lane = lanes.find((l: Lane) => l.id === id)
  if (!lane) return []

  try {
    const { stdout: logOut } = await execAsync(
      `git -C "${lane.path}" log --pretty=format:"%H|%s|%an|%ar" --max-count=20`
    )
    const commits: Commit[] = logOut
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, message, author, date] = line.split('|')
        return {
          hash: (hash ?? '').slice(0, 7),
          message: message ?? '',
          author: author ?? '',
          date: date ?? '',
        }
      })
    return commits
  } catch {
    return []
  }
})
