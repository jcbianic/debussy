import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import type { Lane } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')

  let stdout = ''
  try {
    const result = await execAsync('git worktree list --porcelain')
    stdout = result.stdout
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list worktrees',
    })
  }

  const lanes = parseLanesFromWorktrees(stdout, process.cwd())
  const lane = lanes.find((l: Lane) => l.id === id)

  if (!lane) {
    throw createError({ statusCode: 404, statusMessage: 'Lane not found' })
  }

  // Check if remote tracking branch exists
  let hasRemote = false
  try {
    await execAsync(
      `git -C "${lane.path}" rev-parse --abbrev-ref ${lane.branch}@{u}`
    )
    hasRemote = true
  } catch {
    // no tracking branch
  }

  const cmd = hasRemote
    ? `git -C "${lane.path}" push`
    : `git -C "${lane.path}" push -u origin ${lane.branch}`

  const { stdout: pushOut, stderr } = await execAsync(cmd)

  return { ok: true, output: (pushOut || stderr).trim() }
})
