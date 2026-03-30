import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { parseLanesFromWorktrees } from '../../../utils/lanes'
import type { Lane } from '../../../utils/lanes'

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
  const startedAt = Date.now()

  console.log(
    `[dispatch:${sessionId}] lane=${id} model=${model} cwd=${lane.path}`
  )
  console.log(`[dispatch:${sessionId}] claude ${args.join(' ')}`)

  try {
    const { stdout, stderr } = await execFileAsync('claude', args, {
      cwd: lane.path,
      timeout: 180_000,
      env: { ...process.env },
    })

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
    console.log(
      `[dispatch:${sessionId}] completed in ${elapsed}s (${stdout.length} bytes)`
    )
    if (stderr) {
      console.log(`[dispatch:${sessionId}] stderr: ${stderr.trim()}`)
    }

    return {
      ok: true,
      sessionId,
      output: stdout.trim(),
      elapsed: `${elapsed}s`,
    }
  } catch (err: unknown) {
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
    const e = err as {
      stdout?: string
      stderr?: string
      message?: string
      code?: string | number
      killed?: boolean
    }

    const stdout = e.stdout?.trim() ?? ''
    const stderr = e.stderr?.trim() ?? ''
    const killed = e.killed ?? false
    const exitCode = typeof e.code === 'number' ? e.code : null

    console.error(`[dispatch:${sessionId}] FAILED after ${elapsed}s`)
    console.error(`[dispatch:${sessionId}] exit=${exitCode} killed=${killed}`)
    if (stdout) console.error(`[dispatch:${sessionId}] stdout: ${stdout}`)
    if (stderr) console.error(`[dispatch:${sessionId}] stderr: ${stderr}`)
    if (e.message) console.error(`[dispatch:${sessionId}] error: ${e.message}`)

    // Return structured error as response body (not createError)
    // so the client gets all the debug info
    setResponseStatus(event, 422)
    return {
      ok: false,
      sessionId,
      elapsed: `${elapsed}s`,
      exitCode,
      killed,
      stdout,
      stderr,
      error: e.message ?? 'Dispatch failed',
    }
  }
})
