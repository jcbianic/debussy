import { LANE_TRANSITIONS, LANE_ACTION_TARGET } from '~/shared/types/lanes'
import type { LaneAction } from '~/shared/types/lanes'
import { readLaneRecord, writeLaneRecord } from '../../../utils/lane-store'
import {
  isCleanWorktree,
  pushBranch,
  markPRReady,
  mergePR,
  removeWorktree,
  deleteBranch,
} from '../../../utils/lane-git'
import { resolveDebussyPath } from '../../../utils/debussy'
import path from 'node:path'

const VALID_ACTIONS = new Set<LaneAction>([
  'start',
  'stage',
  'qa',
  'rework',
  'ready',
  'merge',
])

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  const body = await readBody<{ action?: string }>(event)
  const action = body?.action as LaneAction | undefined

  if (!action || !VALID_ACTIONS.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid action. Must be one of: ${[...VALID_ACTIONS].join(', ')}`,
    })
  }

  const record = await readLaneRecord(id)
  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lane ${id} not found`,
    })
  }

  const allowed = LANE_TRANSITIONS[record.state]
  if (!allowed.includes(action)) {
    throw createError({
      statusCode: 422,
      statusMessage: `Cannot ${action} from state "${record.state}". Allowed: ${allowed.join(', ') || 'none'}`,
    })
  }

  // Execute side effects
  const root = await resolveDebussyPath()
  const absWorktree = path.resolve(root, record.worktreePath)

  switch (action) {
    case 'start':
      // No side effects — just marks the lane as actively worked on
      break

    case 'stage': {
      // Guard: worktree must be clean
      const clean = await isCleanWorktree(absWorktree)
      if (!clean) {
        throw createError({
          statusCode: 422,
          statusMessage:
            'Worktree has uncommitted changes. Commit or stash before staging.',
        })
      }
      await pushBranch(record.branch)
      break
    }

    case 'qa':
      // No side effects — marks as under QA review
      break

    case 'rework':
      // No side effects — returns to working state
      break

    case 'ready':
      if (!record.prNumber) {
        throw createError({
          statusCode: 422,
          statusMessage: 'No PR associated with this lane',
        })
      }
      await markPRReady(record.prNumber)
      break

    case 'merge':
      if (!record.prNumber) {
        throw createError({
          statusCode: 422,
          statusMessage: 'No PR associated with this lane',
        })
      }
      await mergePR(record.prNumber)
      // Cleanup worktree and branch
      try {
        await removeWorktree(absWorktree)
      } catch {
        // worktree may already be gone
      }
      try {
        await deleteBranch(record.branch)
      } catch {
        // branch may have been deleted by --delete-branch
      }
      break
  }

  // Update record
  record.state = LANE_ACTION_TARGET[action]
  record.updatedAt = new Date().toISOString()
  await writeLaneRecord(record)

  return record
})
