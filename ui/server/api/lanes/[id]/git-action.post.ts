import type { GitAction } from '~/shared/types/lanes'
import type { LaneRecord } from '~/shared/types/lanes'
import { fetchLanes } from '../../../utils/lanes'
import {
  pushBranch,
  pullBranch,
  checkoutBranch,
  createWorktree,
  fetchIssue,
  parseIssueNumberFromBranch,
  removeWorktree,
} from '../../../utils/lane-git'
import {
  readLaneRecord,
  writeLaneRecord,
  resolveRecordId,
} from '../../../utils/lane-store'

const VALID_ACTIONS = new Set<GitAction>([
  'push',
  'pull',
  'to-worktree',
  'restore',
])

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  const body = await readBody<{ action?: string }>(event)
  const action = body?.action as GitAction | undefined

  if (!action || !VALID_ACTIONS.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid action. Must be one of: ${[...VALID_ACTIONS].join(', ')}`,
    })
  }

  // Handle restore before worktree lookup (orphaned lanes have no worktree)
  if (action === 'restore') {
    const recordId = await resolveRecordId(id)
    const record = await readLaneRecord(recordId)
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: `Lane ${id} not found`,
      })
    }
    try {
      await createWorktree(record.worktreePath, record.branch)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Restore failed'
      throw createError({ statusCode: 422, statusMessage: msg })
    }
    return { ok: true }
  }

  // Resolve lane
  const lanes = await fetchLanes()
  const lane = lanes.find((l) => l.id === id)
  if (!lane || !lane.checkedOutIn) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lane ${id} not found or not checked out`,
    })
  }

  switch (action) {
    case 'push': {
      try {
        await pushBranch(lane.branch)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Push failed'
        throw createError({ statusCode: 422, statusMessage: msg })
      }
      return { ok: true }
    }

    case 'pull': {
      try {
        await pullBranch(lane.path)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Pull failed'
        throw createError({ statusCode: 422, statusMessage: msg })
      }
      return { ok: true }
    }

    case 'to-worktree': {
      if (lane.checkedOutIn !== 'root') {
        throw createError({
          statusCode: 422,
          statusMessage: 'to-worktree is only available on the root lane',
        })
      }
      if (lane.branch === 'main' || lane.branch === 'master') {
        throw createError({
          statusCode: 422,
          statusMessage: 'Cannot detach the main branch to a worktree',
        })
      }

      const issueNum = parseIssueNumberFromBranch(lane.branch)
      const laneId = issueNum
        ? String(issueNum)
        : lane.branch.replace(/\//g, '-')
      const worktreeRelPath = `.worktrees/${laneId}`

      // Check for existing lane record
      const existing = await readLaneRecord(laneId)
      if (existing) {
        throw createError({
          statusCode: 409,
          statusMessage: `Lane ${laneId} already exists`,
        })
      }

      const originalBranch = lane.branch
      const rollback: (() => Promise<void>)[] = []

      try {
        // 1. Switch root to main to free the branch
        await checkoutBranch(lane.path, 'main')
        rollback.push(() => checkoutBranch(lane.path, originalBranch))

        // 2. Create worktree for the feature branch
        const absPath = await createWorktree(worktreeRelPath, originalBranch)
        rollback.push(() => removeWorktree(absPath))

        // 3. Fetch issue title (best-effort)
        let issueTitle = originalBranch
        if (issueNum) {
          try {
            const issue = await fetchIssue(issueNum)
            issueTitle = issue.title
          } catch {
            // keep branch name as fallback
          }
        }

        // 4. Write lane record
        const now = new Date().toISOString()
        const record: LaneRecord = {
          id: laneId,
          issueNumber: issueNum ?? 0,
          issueTitle,
          branch: originalBranch,
          worktreePath: worktreeRelPath,
          prNumber: null,
          state: 'working',
          createdAt: now,
          updatedAt: now,
        }
        await writeLaneRecord(record)

        return record
      } catch (err) {
        // Rollback in reverse order
        for (const undo of rollback.reverse()) {
          try {
            await undo()
          } catch {
            // best-effort rollback
          }
        }
        throw err
      }
    }
  }
})
