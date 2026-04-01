import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import type { Lane } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  const body = await readBody<{ message?: string }>(event)

  if (!body?.message?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Commit message is required',
    })
  }

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

  await execAsync(`git -C "${lane.path}" add -A`)
  const { stdout: commitOut } = await execAsync(
    `git -C "${lane.path}" commit -m ${JSON.stringify(body.message.trim())}`
  )

  return { ok: true, output: commitOut.trim() }
})
