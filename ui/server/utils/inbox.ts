import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from './debussy'
import type { ReviewGroup, ReviewItem } from './lanes'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InboxRequestItem {
  id: string
  title: string
  subtitle: string
  content: string
  code?: string | null
}

export interface InboxRequest {
  session_id: string
  source: string
  title: string
  icon?: string
  created_at: string
  items: InboxRequestItem[]
}

export interface InboxDecision {
  action: string
  comment?: string
}

export interface InboxResponse {
  submitted_at: string
  session_id: string
  decisions: Record<string, InboxDecision>
  summary: Record<string, number>
}

export interface InboxSession {
  sessionId: string
  request: InboxRequest
  hasResponse: boolean
  partialDecisions: Record<string, InboxDecision>
}

// ─── Resolve ─────────────────────────────────────────────────────────────────

export async function resolveInboxPath(): Promise<string> {
  return resolveDebussyPath('.debussy', 'inbox')
}

// ─── Scan ────────────────────────────────────────────────────────────────────

export async function scanInboxSessions(
  inboxDir: string
): Promise<InboxSession[]> {
  const entries = await readdir(inboxDir, { withFileTypes: true })
  const sessions: InboxSession[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const sessionDir = path.join(inboxDir, entry.name)
    const requestPath = path.join(sessionDir, 'request.json')
    const responsePath = path.join(sessionDir, 'response.json')
    const partialPath = path.join(sessionDir, 'response.partial.json')

    try {
      const raw = JSON.parse(await readFile(requestPath, 'utf8'))
      if (!raw || !raw.session_id || !Array.isArray(raw.items)) continue

      const hasResponse = await stat(responsePath)
        .then(() => true)
        .catch(() => false)

      // Skip completed sessions
      if (hasResponse) continue

      let partialDecisions: Record<string, InboxDecision> = {}
      try {
        const partial = JSON.parse(await readFile(partialPath, 'utf8'))
        if (partial?.decisions) partialDecisions = partial.decisions
      } catch {
        // no partial yet
      }

      sessions.push({
        sessionId: entry.name,
        request: raw as InboxRequest,
        hasResponse,
        partialDecisions,
      })
    } catch {
      // request.json missing or invalid — skip
    }
  }

  return sessions
}

// ─── Convert ─────────────────────────────────────────────────────────────────

export function inboxSessionToReviewGroup(session: InboxSession): ReviewGroup {
  const { request, sessionId, partialDecisions } = session

  const items: ReviewItem[] = request.items.map((item) => {
    const decision = partialDecisions[item.id]
    let status: ReviewItem['status'] = 'pending'
    if (decision) {
      status = decision.action === 'approved' ? 'approved' : 'rejected'
    }

    return {
      id: `${sessionId}::${item.id}`,
      title: item.title,
      subtitle: item.subtitle,
      status,
      type: request.source,
      createdAt: request.created_at,
      rounds: [
        {
          roundNumber: 1,
          proposedAt: request.created_at,
          content: item.content,
          code: item.code ?? undefined,
        },
      ],
    }
  })

  return {
    id: sessionId,
    title: request.title,
    icon: request.icon ?? 'i-heroicons-inbox',
    source: request.source,
    type: request.source,
    inboxSessionId: sessionId,
    items,
  }
}
