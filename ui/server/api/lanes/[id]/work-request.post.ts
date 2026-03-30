import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  readLaneRecord,
  resolveRecordId,
  writeWorkRequest,
} from '../../../utils/lane-store'
import { writeSession } from '../../../utils/dispatch-store'
import type { DispatchSession } from '../../../utils/dispatch-store'
import { getWorkConfig } from '../../../utils/debussy-config'
import { resolveDebussyPath } from '../../../utils/debussy'

const execFileAsync = promisify(execFile)

async function getCurrentBranch(): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync('git', [
      'symbolic-ref',
      '--short',
      'HEAD',
    ])
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

  // Create dispatch session record
  const sessionId = randomUUID().slice(0, 8)
  const session: DispatchSession = {
    sessionId,
    laneId: recordId,
    prompt: command,
    model: 'opus',
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    elapsed: null,
    output: null,
    error: null,
    exitCode: null,
    killed: false,
  }
  await writeSession(session)

  console.log(
    `[work-request:${sessionId}] lane=${recordId} cwd=${absoluteWtPath}`
  )

  // Spawn claude in background — track completion
  const startedAt = Date.now()
  execFileAsync('claude', ['-p', command, '--max-turns', '200'], {
    cwd: absoluteWtPath,
    timeout: 600_000,
    maxBuffer: 10 * 1024 * 1024, // 10 MB — long workflows produce large output
    env: { ...process.env },
  })
    .then(
      async ({ stdout, stderr }) => {
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
        console.log(
          `[work-request:${sessionId}] completed in ${elapsed}s (${stdout.length} bytes)`
        )
        if (stderr) {
          console.log(`[work-request:${sessionId}] stderr: ${stderr.trim()}`)
        }
        await writeSession({
          ...session,
          status: 'completed',
          completedAt: new Date().toISOString(),
          elapsed: `${elapsed}s`,
          output: stdout.trim(),
        })
      },
      async (err: unknown) => {
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
        const e = err as {
          stdout?: string
          stderr?: string
          message?: string
          code?: string | number
          killed?: boolean
        }
        console.error(`[work-request:${sessionId}] FAILED after ${elapsed}s`)
        if (e.message) console.error(`[work-request:${sessionId}] ${e.message}`)

        await writeSession({
          ...session,
          status: 'failed',
          completedAt: new Date().toISOString(),
          elapsed: `${elapsed}s`,
          output: e.stdout?.trim() ?? null,
          error: e.stderr?.trim() || e.message || 'Work request failed',
          exitCode: typeof e.code === 'number' ? e.code : null,
          killed: e.killed ?? false,
        })
      }
    )
    .catch((err) => {
      console.error(`[work-request:${sessionId}] post-process error:`, err)
    })

  // Return immediately
  setResponseStatus(event, 202)
  return { ...result, sessionId, command }
})
