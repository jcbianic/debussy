import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import type { Lane } from '../../../utils/lanes'
import { writeSession } from '../../../utils/dispatch-store'
import type { DispatchSession } from '../../../utils/dispatch-store'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  const body = await readBody<{ prompt: string; model?: string }>(event)
  if (!body?.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing prompt' })
  }

  // Resolve lane working directory
  let wtOutput: string
  try {
    const result = await execFileAsync('git', [
      'worktree',
      'list',
      '--porcelain',
    ])
    wtOutput = result.stdout
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list worktrees',
    })
  }

  const lanes = parseLanesFromWorktrees(wtOutput, process.cwd())
  const lane = lanes.find((l: Lane) => l.id === id)
  if (!lane) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lane ${id} not found`,
    })
  }

  const sessionId = randomUUID().slice(0, 8)
  const model = body.model ?? 'haiku'
  const args = [
    '-p',
    body.prompt,
    '--model',
    model,
    '--max-turns',
    '10',
    '--dangerously-skip-permissions',
  ]

  // Create session record (running)
  const session: DispatchSession = {
    sessionId,
    laneId: id,
    prompt: body.prompt,
    model,
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
    `[dispatch:${sessionId}] lane=${id} model=${model} cwd=${lane.path}`
  )

  // Spawn in background — don't await
  const startedAt = Date.now()
  execFileAsync('claude', args, {
    cwd: lane.path,
    timeout: 180_000,
    env: { ...process.env },
  }).then(
    async ({ stdout, stderr }) => {
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
      console.log(
        `[dispatch:${sessionId}] completed in ${elapsed}s (${stdout.length} bytes)`
      )
      if (stderr) {
        console.log(`[dispatch:${sessionId}] stderr: ${stderr.trim()}`)
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
      console.error(`[dispatch:${sessionId}] FAILED after ${elapsed}s`)
      if (e.message) console.error(`[dispatch:${sessionId}] ${e.message}`)

      await writeSession({
        ...session,
        status: 'failed',
        completedAt: new Date().toISOString(),
        elapsed: `${elapsed}s`,
        output: e.stdout?.trim() ?? null,
        error: e.stderr?.trim() || e.message || 'Dispatch failed',
        exitCode: typeof e.code === 'number' ? e.code : null,
        killed: e.killed ?? false,
      })
    }
  )

  // Return immediately
  setResponseStatus(event, 202)
  return { sessionId, status: 'running' }
})
