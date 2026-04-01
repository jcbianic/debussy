import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fetchLanes } from '../../../utils/lanes'
import type { Commit } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')

  let lanes
  try {
    lanes = await fetchLanes()
  } catch {
    return []
  }

  const lane = lanes.find((l) => l.id === id)
  if (!lane) return []

  try {
    // Detect default branch (main or master)
    let defaultBranch = 'main'
    try {
      const { stdout: symRef } = await execAsync(
        `git -C "${lane.path}" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null`
      )
      defaultBranch = symRef.trim().replace('refs/remotes/origin/', '')
    } catch {
      // fallback to main
    }

    // Use branch ref instead of HEAD — works even when branch is not checked out
    const ref = lane.branch
    const range = ref === defaultBranch ? ref : `${defaultBranch}..${ref}`
    const { stdout: logOut } = await execAsync(
      `git -C "${lane.path}" log ${range} --pretty=format:"%H|%s|%an|%ar" --max-count=20`
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
