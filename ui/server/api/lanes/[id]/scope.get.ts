import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readScopeMd, resolveRecordId } from '../../../utils/lane-store'

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
  const content = await readScopeMd(recordId)
  return { content }
})
