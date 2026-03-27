import { readFile, writeFile, rename } from 'node:fs/promises'
import path from 'node:path'
import { resolveInboxPath } from '../../utils/inbox'
import type { InboxRequest, InboxDecision } from '../../utils/inbox'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sessionId' })
  }

  const body = await readBody<{
    itemId: string
    action: string
    comment?: string
  }>(event)

  if (!body?.itemId || !body?.action) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing itemId or action',
    })
  }

  const inboxDir = await resolveInboxPath()
  const sessionDir = path.join(inboxDir, sessionId)
  const requestPath = path.join(sessionDir, 'request.json')
  const partialPath = path.join(sessionDir, 'response.partial.json')
  const responsePath = path.join(sessionDir, 'response.json')
  const tmpPath = path.join(sessionDir, '.response.tmp.json')

  // Read request to know the full item list
  let request: InboxRequest
  try {
    request = JSON.parse(await readFile(requestPath, 'utf8'))
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: `Session ${sessionId} not found`,
    })
  }

  // Read existing partial decisions
  let decisions: Record<string, InboxDecision> = {}
  try {
    const partial = JSON.parse(await readFile(partialPath, 'utf8'))
    if (partial?.decisions) decisions = partial.decisions
  } catch {
    // no partial yet
  }

  // Merge new decision
  decisions[body.itemId] = {
    action: body.action,
    ...(body.comment ? { comment: body.comment } : {}),
  }

  // Check if all items are decided
  const allItemIds = new Set(request.items.map((i) => i.id))
  const decidedIds = new Set(Object.keys(decisions))
  const complete = [...allItemIds].every((id) => decidedIds.has(id))

  // Build summary
  const summary: Record<string, number> = { total: allItemIds.size }
  for (const d of Object.values(decisions)) {
    summary[d.action] = (summary[d.action] ?? 0) + 1
  }

  const responseData = {
    submitted_at: new Date().toISOString(),
    session_id: sessionId,
    decisions,
    summary,
  }

  if (complete) {
    // Atomic write: tmp → rename to response.json (triggers skill filewatch)
    await writeFile(tmpPath, JSON.stringify(responseData, null, 2))
    await rename(tmpPath, responsePath)
    // Clean up partial
    try {
      const { unlink } = await import('node:fs/promises')
      await unlink(partialPath)
    } catch {
      // partial may not exist
    }
  } else {
    // Save progress to partial
    await writeFile(partialPath, JSON.stringify(responseData, null, 2))
  }

  return { ok: true, complete }
})
