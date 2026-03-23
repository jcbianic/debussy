// ─── Types (re-exported from server/utils/lanes for client use) ───────────────

export interface Round {
  roundNumber: number
  proposedAt: string
  content: string
  code?: string
  feedback?: string
  feedbackAt?: string
  feedbackStatus?: 'approved' | 'changes-requested' | 'rejected'
}

export interface ReviewItem {
  id: string
  title: string
  subtitle: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'feedback' | 'code-review' | 'workflow'
  createdAt: string
  rounds: Round[]
}

export interface ReviewGroup {
  id: string
  title: string
  icon: string
  source: string
  type: string
  items: ReviewItem[]
}

export interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  intent?: string
  groups: ReviewGroup[]
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

export interface ReviewDetail {
  id: string
  title: string
  source: string
  status: 'pending' | 'approved' | 'rejected'
  body: string
  code: string | null
}

// ─── useMockData ─────────────────────────────────────────────────────────────

/**
 * Provide reactive access to lane, review, workflow, and commit data via API.
 */
export function useLanes() {
  const { data: lanesData } = useFetch<Lane[]>('/api/lanes')

  const lanes = computed(() => lanesData.value ?? [])

  const pendingCount = (items: ReviewItem[]) =>
    items.filter((i) => i.status === 'pending').length

  const lanesWithPending = computed(() =>
    lanes.value.map((l) => ({
      ...l,
      pending: l.groups
        .flatMap((g) => g.items)
        .filter((i) => i.status === 'pending').length,
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

  const getReview = (id: string): ReviewDetail | null => {
    for (const lane of lanes.value) {
      for (const group of lane.groups) {
        const item = group.items.find((i) => i.id === id)
        if (item) {
          return {
            id: item.id,
            title: item.title,
            source: `${group.title} · ${group.source}`,
            status: item.status,
            body: item.rounds[0]?.content ?? '',
            code: item.rounds[0]?.code ?? null,
          }
        }
      }
    }
    return null
  }

  return {
    lanes,
    lanesWithPending,
    totalPending,
    getLane,
    getWorkflow,
    getCommits,
    getReview,
    pendingCount,
  }
}
