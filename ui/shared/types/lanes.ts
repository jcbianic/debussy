// ─── Lane State Machine ──────────────────────────────────────────────────────

export type LaneState =
  | 'created'
  | 'working'
  | 'staged'
  | 'qa'
  | 'ready'
  | 'merged'

export type LaneAction = 'start' | 'stage' | 'qa' | 'rework' | 'ready' | 'merge'

export type GitAction = 'push' | 'pull' | 'to-worktree'

export const LANE_TRANSITIONS: Record<LaneState, LaneAction[]> = {
  created: ['start'],
  working: ['stage'],
  staged: ['qa'],
  qa: ['ready', 'rework'],
  ready: ['merge'],
  merged: [],
}

export const LANE_ACTION_TARGET: Record<LaneAction, LaneState> = {
  start: 'working',
  stage: 'staged',
  qa: 'qa',
  rework: 'working',
  ready: 'ready',
  merge: 'merged',
}

// ─── Lane Record ─────────────────────────────────────────────────────────────

export interface LaneRecord {
  id: string
  issueNumber: number
  issueTitle: string
  branch: string
  worktreePath: string
  prNumber: number | null
  state: LaneState
  createdAt: string
  updatedAt: string
}
