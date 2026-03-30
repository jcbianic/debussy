import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  resolveSessionPath,
  parseSessionMessages,
} from '../../../../../utils/session-messages'
import { readSession } from '../../../../../utils/dispatch-store'
import { parseLanesFromWorktrees } from '../../../../../utils/lanes'
import type { ChatMessage } from '../../../../../utils/session-messages'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const laneId = getRouterParam(event, 'id')
  const sessionId = getRouterParam(event, 'sessionId')
  if (!laneId || !sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
  }

  // Check if this is a dispatch session first
  const dispatchSession = await readSession(laneId, sessionId)
  if (dispatchSession) {
    return dispatchToChat(dispatchSession)
  }

  // Otherwise, resolve as CLI session from JSONL
  let repoRoot = process.cwd()
  try {
    const { stdout } = await execFileAsync('git', [
      'worktree',
      'list',
      '--porcelain',
    ])
    const lanes = parseLanesFromWorktrees(stdout, process.cwd())
    if (lanes.length > 0) repoRoot = lanes[0]!.path
  } catch {
    // fallback to cwd
  }

  const filePath = resolveSessionPath(repoRoot, sessionId)
  if (!filePath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session file not found',
    })
  }

  const messages = await parseSessionMessages(filePath)
  return messages
})

function dispatchToChat(session: {
  prompt: string
  startedAt: string
  output: string | null
  error: string | null
  model: string
}): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      id: 'dispatch-prompt',
      role: 'user',
      content: session.prompt,
      timestamp: session.startedAt,
    },
  ]
  if (session.output) {
    messages.push({
      id: 'dispatch-output',
      role: 'assistant',
      content: session.output,
      timestamp: session.startedAt,
      model: session.model,
    })
  }
  if (session.error) {
    messages.push({
      id: 'dispatch-error',
      role: 'assistant',
      content: `**Error:** ${session.error}`,
      timestamp: session.startedAt,
      model: session.model,
    })
  }
  return messages
}
