import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  readLaneRecord,
  resolveRecordId,
  writeWorkRequest,
} from '../../../utils/lane-store'

const execAsync = promisify(exec)

async function getCurrentBranch(): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync('git symbolic-ref --short HEAD')
    return stdout.trim()
  } catch {
    return undefined
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing lane id',
    })
  }

  const branch = await getCurrentBranch()
  const recordId = await resolveRecordId(id, branch)

  const record = await readLaneRecord(recordId)
  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lane not found',
    })
  }

  const body = await readBody<{ workflow: string }>(event)
  if (!body?.workflow) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing workflow path',
    })
  }

  const result = await writeWorkRequest(recordId, body.workflow)
  return result
})
