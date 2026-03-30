import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  findSessionPath,
  findSessionByPrompt,
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

  // Resolve repo root from worktrees
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

  // Try to find JSONL by exact sessionId first (CLI sessions)
  const filePath = await findSessionPath(repoRoot, sessionId)
  if (filePath) {
    const messages = await parseSessionMessages(filePath)
    if (messages.length > 0) return messages
  }

  // For dispatch sessions, the CLI sessionId differs from dispatch ID.
  // Look up the dispatch record, then find the JSONL by prompt + timestamp match.
  const dispatchSession = await readSession(laneId, sessionId)
  if (dispatchSession) {
    const jsonlPath = await findSessionByPrompt(
      repoRoot,
      dispatchSession.prompt,
      dispatchSession.startedAt
    )
    if (jsonlPath) {
      const messages = await parseSessionMessages(jsonlPath)
      if (messages.length > 0) return messages
    }
    // Final fallback: synthesize from stored prompt/output
    return dispatchToChat(dispatchSession)
  }

  return []
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
