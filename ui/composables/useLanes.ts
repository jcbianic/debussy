import type { Item, Review } from '~/shared/types/reviews'
import { itemStatus } from '~/shared/types/reviews'
import type {
  LaneState,
  LaneAction,
  LaneRecord,
  GitAction,
} from '~/shared/types/lanes'

export interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  intent?: string
  state?: LaneState
  issueNumber?: number
  prNumber?: number | null
  orphaned?: boolean
  reviews: Review[]
}

export interface WorkflowStep {
  name: string
  state: 'done' | 'running' | 'waiting' | 'pending'
  detail?: string
  duration?: string
}

export interface WorkflowRun {
  file: string
  status: string
  currentStep: number
  totalSteps: number
  elapsed: string
  startedAt: string
  steps: WorkflowStep[]
}

export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  pr?: string
}

export interface LaneStatus {
  changes: {
    modified: number
    added: number
    deleted: number
    total: number
    files: string[]
  }
  sync: { ahead: number; behind: number; remote: string | null }
}

export interface ReviewDetail {
  id: string
  title: string
  source: string
  status: ItemStatus
  body: string
  code: string | null
}

export interface DispatchSession {
  sessionId: string
  source: 'dispatch'
  laneId: string
  prompt: string
  model: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt: string | null
  elapsed: string | null
  output: string | null
  error: string | null
  exitCode: number | null
  killed: boolean
}

export interface CliSession {
  sessionId: string
  source: 'cli'
  branch: string
  cwd: string
  startedAt: string
  lastActivity: string
  model: string
  prompt: string
  slug: string
  status: 'running' | 'completed'
}

export type LaneSession = DispatchSession | CliSession

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  tools?: { name: string; summary: string }[]
  timestamp: string
  model?: string
}

// ─── useLanes ────────────────────────────────────────────────────────────────

/**
 * Provide reactive access to lane, review, workflow, and commit data via API.
 */
export function useLanes() {
  const { data: lanesData, refresh } = useFetch<Lane[]>('/api/lanes')

  const lanes = computed(() => lanesData.value ?? [])

  const pendingCount = (items: Item[]) =>
    items.filter((i) => itemStatus(i) === 'pending').length

  const lanesWithPending = computed(() =>
    lanes.value.map((l) => ({
      ...l,
      pending: l.reviews
        .flatMap((r) => r.items)
        .filter((i) => itemStatus(i) === 'pending').length,
    }))
  )

  const totalPending = computed(() =>
    lanesWithPending.value.reduce((sum, l) => sum + l.pending, 0)
  )

  const getLane = (id: string) =>
    lanes.value.find((l) => l.id === id) ?? lanes.value[0] ?? null

  const getWorkflow = (laneId: string): Promise<WorkflowRun | null> =>
    $fetch<WorkflowRun | null>(`/api/lanes/${laneId}/workflow`).catch(
      () => null
    )

  const getCommits = (laneId: string): Promise<Commit[]> =>
    $fetch<Commit[]>(`/api/lanes/${laneId}/commits`).catch(() => [])

  const getStatus = (laneId: string): Promise<LaneStatus | null> =>
    $fetch<LaneStatus | null>(`/api/lanes/${laneId}/status`).catch(() => null)

  const getReview = (id: string): ReviewDetail | null => {
    for (const lane of lanes.value) {
      for (const review of lane.reviews) {
        const item = review.items.find((i) => i.id === id)
        if (item) {
          return {
            id: item.id,
            title: item.title,
            source: `${review.title} · ${review.source}`,
            status: itemStatus(item),
            body: item.iterations.at(-1)?.content ?? '',
            code: item.iterations.at(-1)?.code ?? null,
          }
        }
      }
    }
    return null
  }

  const createLane = async (issueNumber: number): Promise<LaneRecord> => {
    const record = await $fetch<LaneRecord>('/api/lanes', {
      method: 'POST',
      body: { issueNumber },
    })
    await refresh()
    return record
  }

  const transitionLane = async (
    id: string,
    action: LaneAction
  ): Promise<LaneRecord> => {
    const record = await $fetch<LaneRecord>(`/api/lanes/${id}/transition`, {
      method: 'POST',
      body: { action },
    })
    await refresh()
    return record
  }

  const gitAction = async (id: string, action: GitAction): Promise<unknown> => {
    const result = await $fetch(`/api/lanes/${id}/git-action`, {
      method: 'POST',
      body: { action },
    })
    await refresh()
    return result
  }

  const deleteLane = async (id: string): Promise<void> => {
    await $fetch(`/api/lanes/${id}`, { method: 'DELETE' })
    await refresh()
  }

  const getScope = (laneId: string): Promise<{ content: string | null }> =>
    $fetch<{ content: string | null }>(`/api/lanes/${laneId}/scope`).catch(
      () => ({ content: null })
    )

  const requestWork = async (
    id: string,
    workflow: string
  ): Promise<{ file: string; command: string }> => {
    return await $fetch<{ file: string; command: string }>(
      `/api/lanes/${id}/work-request`,
      {
        method: 'POST',
        body: { workflow },
      }
    )
  }

  const dispatch = async (
    id: string,
    prompt: string,
    model?: string
  ): Promise<{ sessionId: string }> => {
    return await $fetch<{ sessionId: string }>(`/api/lanes/${id}/dispatch`, {
      method: 'POST',
      body: { prompt, model },
    })
  }

  const getSessions = (laneId: string): Promise<LaneSession[]> =>
    $fetch<LaneSession[]>(`/api/lanes/${laneId}/sessions`).catch(() => [])

  const getSession = (
    laneId: string,
    sessionId: string
  ): Promise<DispatchSession | null> =>
    $fetch<DispatchSession | null>(
      `/api/lanes/${laneId}/sessions/${sessionId}`
    ).catch(() => null)

  const getSessionMessages = (
    laneId: string,
    sessionId: string
  ): Promise<ChatMessage[]> =>
    $fetch<ChatMessage[]>(
      `/api/lanes/${laneId}/sessions/${sessionId}/messages`
    ).catch(() => [])

  return {
    lanes,
    lanesWithPending,
    totalPending,
    getLane,
    getWorkflow,
    getCommits,
    getStatus,
    getReview,
    pendingCount,
    refresh,
    createLane,
    transitionLane,
    gitAction,
    deleteLane,
    getScope,
    requestWork,
    dispatch,
    getSessions,
    getSession,
    getSessionMessages,
  }
}
