import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fetchLanes } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')

  const lanes = await fetchLanes()
  const lane = lanes.find((l) => l.id === id)

  if (!lane || !lane.checkedOutIn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lane not found or not checked out',
    })
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
