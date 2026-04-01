import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fetchLanes } from '../../../utils/lanes'

const execAsync = promisify(exec)

async function git(cwd: string, args: string): Promise<string> {
  const { stdout } = await execAsync(`git -C "${cwd}" ${args}`)
  return stdout.trim()
}

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')

  let lanes
  try {
    lanes = await fetchLanes()
  } catch {
    return null
  }

  const lane = lanes.find((l) => l.id === id)
  if (!lane) return null

  // ── Local changes (only available when branch is checked out) ────
  let modified = 0
  let added = 0
  let deleted = 0
  const files: string[] = []

  if (lane.checkedOutIn) {
    try {
      const status = await git(lane.path, 'status --porcelain')
      for (const line of status.split('\n').filter(Boolean)) {
        const code = line.slice(0, 2)
        const file = line.slice(3)
        files.push(file)
        if (code.includes('D')) deleted++
        else if (code === '??' || code.includes('A')) added++
        else modified++
      }
    } catch {
      // ignore
    }
  }

  // ── Remote sync ──────────────────────────────────────────────────
  let remote: string | null = null
  let ahead = 0
  let behind = 0

  try {
    remote = await git(lane.path, `rev-parse --abbrev-ref ${lane.branch}@{u}`)
  } catch {
    // no tracking branch
  }

  if (remote) {
    try {
      const counts = await git(
        lane.path,
        `rev-list --left-right --count ${remote}...${lane.branch}`
      )
      const [b, a] = counts.split(/\s+/)
      behind = parseInt(b ?? '0', 10)
      ahead = parseInt(a ?? '0', 10)
    } catch {
      // ignore
    }
  }

  return {
    changes: { modified, added, deleted, total: files.length, files },
    sync: { ahead, behind, remote },
  }
})
