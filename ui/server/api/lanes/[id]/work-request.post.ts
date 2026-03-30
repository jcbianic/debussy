import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import {
  readLaneRecord,
  resolveRecordId,
  writeWorkRequest,
} from '../../../utils/lane-store'
import { getWorkConfig } from '../../../utils/debussy-config'
import { resolveDebussyPath } from '../../../utils/debussy'

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

  const [result, workConfig, mainRoot] = await Promise.all([
    writeWorkRequest(recordId, body.workflow),
    getWorkConfig(),
    resolveDebussyPath(),
  ])

  const absoluteWtPath = path.resolve(mainRoot, record.worktreePath)

  // Build workflow-run command string
  const parts = [`/workflow-run ${body.workflow}`]
  parts.push(`--cwd ${absoluteWtPath}`)
  const escapedTitle = record.issueTitle.replace(/"/g, '\\"')
  parts.push(`--input task="${escapedTitle}"`)
  if (workConfig.test_cmd) {
    parts.push(`--input test_cmd="${workConfig.test_cmd}"`)
  }
  const command = parts.join(' ')

  // Dispatch claude in background
  const child = spawn('claude', ['-p', command, '--max-turns', '200'], {
    cwd: mainRoot,
    detached: true,
    stdio: 'ignore',
  })
  child.unref()

  return { ...result, command, pid: child.pid }
})
