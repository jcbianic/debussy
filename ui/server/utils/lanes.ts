import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { parse as parseYaml } from 'yaml'
import type { Review } from './reviews'
import type { LaneState } from '~/shared/types/lanes'

const execAsync = promisify(exec)

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  checkedOutIn: 'root' | 'worktree' | null
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

// ─── Worktree parsing ────────────────────────────────────────────────────────

interface WorktreeEntry {
  path: string
  branch: string | null
  isRoot: boolean
}

function parseWorktrees(stdout: string): WorktreeEntry[] {
  if (!stdout.trim()) return []

  const blocks = stdout
    .trim()
    .split(/\n\n+/)
    .filter((b) => b.trim())
  const result: WorktreeEntry[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!
    const lines = block.split('\n')

    const pathLine = lines.find((l) => l.startsWith('worktree '))
    if (!pathLine) continue
    const worktreePath = pathLine.replace('worktree ', '').trim()

    const branchLine = lines.find((l) => l.startsWith('branch '))
    let branch: string | null = null
    if (branchLine) {
      branch = branchLine
        .replace('branch refs/heads/', '')
        .replace('branch ', '')
        .trim()
    }

    result.push({ path: worktreePath, branch, isRoot: i === 0 })
  }

  return result
}

// ─── parseLanes ──────────────────────────────────────────────────────────────

export function parseLanes(
  branchesStdout: string,
  worktreeStdout: string,
  cwd: string
): Lane[] {
  const branches = branchesStdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (branches.length === 0) return []

  const worktrees = parseWorktrees(worktreeStdout)
  const rootPath = worktrees[0]?.path ?? cwd

  // Map branch → worktree entry
  const branchToWorktree = new Map<string, WorktreeEntry>()
  for (const wt of worktrees) {
    if (wt.branch) {
      branchToWorktree.set(wt.branch, wt)
    }
  }

  const lanes: Lane[] = branches.map((branch) => {
    const wt = branchToWorktree.get(branch)
    let checkedOutIn: Lane['checkedOutIn'] = null
    let lanePath = rootPath

    if (wt) {
      checkedOutIn = wt.isRoot ? 'root' : 'worktree'
      lanePath = wt.path
    }

    return {
      id: branch,
      branch,
      path: lanePath,
      isActive: false,
      checkedOutIn,
      reviews: [],
    }
  })

  // Mark the lane whose worktree contains cwd as active
  const activePaths = lanes
    .filter((l) => l.checkedOutIn !== null)
    .map((l) => l.path)
    .filter((p) => cwd === p || cwd.startsWith(p + path.sep))
    .sort((a, b) => b.length - a.length)

  if (activePaths.length > 0) {
    const activePath = activePaths[0]!
    const activeLane = lanes.find((l) => l.path === activePath)
    if (activeLane) activeLane.isActive = true
  }

  return lanes
}

// ─── fetchLanes ──────────────────────────────────────────────────────────────

export async function fetchLanes(): Promise<Lane[]> {
  const [branchResult, worktreeResult] = await Promise.all([
    execAsync(
      "git for-each-ref --sort=-committerdate --format='%(refname:short)' refs/heads/"
    ),
    execAsync('git worktree list --porcelain'),
  ])
  const lanes = parseLanes(
    branchResult.stdout,
    worktreeResult.stdout,
    process.cwd()
  )

  // Hoist default branch to top
  let defaultBranch = 'main'
  try {
    const { stdout } = await execAsync(
      'git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null'
    )
    defaultBranch = stdout.trim().replace('refs/remotes/origin/', '')
  } catch {
    if (!lanes.some((l) => l.branch === 'main')) {
      defaultBranch = 'master'
    }
  }

  const defaultIdx = lanes.findIndex((l) => l.branch === defaultBranch)
  if (defaultIdx > 0) {
    const [defaultLane] = lanes.splice(defaultIdx, 1)
    lanes.unshift(defaultLane!)
  }

  return lanes
}

// ─── stateJsonToWorkflowRun ───────────────────────────────────────────────────

export function stateJsonToWorkflowRun(
  data: Record<string, unknown>
): WorkflowRun | null {
  if (typeof data !== 'object' || !data) return null

  const steps = data.steps as
    | Record<string, Record<string, unknown>>
    | undefined
  if (!steps) return null

  const stepKeys = Object.keys(steps)
  const totalSteps = stepKeys.length
  const currentStepKey =
    typeof data.current_step === 'string' ? data.current_step : stepKeys[0]
  const currentStep = Math.max(
    1,
    stepKeys.indexOf(currentStepKey as string) + 1
  )

  const createdAt = typeof data.created_at === 'string' ? data.created_at : ''
  const updatedAt =
    typeof data.updated_at === 'string' ? data.updated_at : createdAt

  let elapsed = ''
  if (createdAt && updatedAt) {
    const ms = new Date(updatedAt).getTime() - new Date(createdAt).getTime()
    if (!isNaN(ms)) {
      const secs = Math.floor(ms / 1000)
      elapsed =
        secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`
    }
  }

  const startedAt = createdAt
    ? new Date(createdAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const mappedSteps: WorkflowStep[] = stepKeys.map((key) => {
    const step = steps[key]!
    const status = step.status as string
    let state: WorkflowStep['state']
    if (status === 'done' || status === 'completed' || status === 'approved')
      state = 'done'
    else if (status === 'rejected') state = 'done'
    else if (status === 'pending_review') state = 'waiting'
    else if (status === 'revision_requested') state = 'running'
    else if (status === 'in_progress') state = 'running'
    else state = 'pending'

    return { name: (step.name as string) ?? key, state }
  })

  return {
    file: (data.workflow as string) ?? '',
    status: (data.status as string) ?? '',
    currentStep,
    totalSteps,
    elapsed,
    startedAt,
    steps: mappedSteps,
  }
}

// ─── workflowYamlToSkeleton ─────────────────────────────────────────────────

export function workflowYamlToSkeleton(
  yamlContent: string,
  filePath: string
): WorkflowRun | null {
  try {
    const doc = parseYaml(yamlContent) as Record<string, unknown>
    const steps = doc.steps as Array<Record<string, unknown>> | undefined
    if (!Array.isArray(steps) || steps.length === 0) return null

    return {
      file: filePath,
      status: 'skeleton',
      currentStep: 0,
      totalSteps: steps.length,
      elapsed: '',
      startedAt: '',
      steps: steps.map((s) => ({
        name: (s.name as string) ?? (s.id as string) ?? 'Step',
        state: 'pending' as const,
      })),
    }
  } catch {
    return null
  }
}
