import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fetchLanes } from '../../../utils/lanes'

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

  const lanes = await fetchLanes()
  const lane = lanes.find((l) => l.id === id)

  if (!lane || !lane.checkedOutIn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lane not found or not checked out',
    })
  }

  await execAsync(`git -C "${lane.path}" add -A`)
  const { stdout } = await execAsync(
    `git -C "${lane.path}" commit -m ${JSON.stringify(body.message.trim())}`
  )

  return { ok: true, output: stdout.trim() }
})
