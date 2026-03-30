import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { Review } from './reviews'
import type { LaneState } from '~/shared/types/lanes'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── parseLanesFromWorktrees ──────────────────────────────────────────────────

export function parseLanesFromWorktrees(stdout: string, cwd: string): Lane[] {
  if (!stdout.trim()) return []

  const blocks = stdout
    .trim()
    .split(/\n\n+/)
    .filter((b) => b.trim())
  const result: Lane[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!
    const lines = block.split('\n')

    const pathLine = lines.find((l) => l.startsWith('worktree '))
    if (!pathLine) continue
    const worktreePath = pathLine.replace('worktree ', '').trim()

    const branchLine = lines.find((l) => l.startsWith('branch '))
    let branch: string
    if (branchLine) {
      branch = branchLine
        .replace('branch refs/heads/', '')
        .replace('branch ', '')
        .trim()
    } else if (lines.some((l) => l.trim() === 'detached')) {
      branch = 'detached'
    } else {
      branch = 'unknown'
    }

    const id = i === 0 ? 'root' : path.basename(worktreePath)

    result.push({
      id,
      branch,
      path: worktreePath,
      isActive: false,
      reviews: [],
    })
  }

  // Mark the most specific worktree containing cwd as active
  const activeWorktreePath = result
    .map((l) => l.path)
    .filter((p) => cwd === p || cwd.startsWith(p + path.sep))
    .sort((a, b) => b.length - a.length)[0]

  for (const lane of result) {
    lane.isActive = lane.path === activeWorktreePath
  }

  return result
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
    if (status === 'done') state = 'done'
    else if (status === 'pending_review') state = 'waiting'
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
