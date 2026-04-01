import {
  readLaneRecord,
  deleteLaneRecord,
  resolveRecordId,
} from '../../../utils/lane-store'
import { removeWorktree, closePR, deleteBranch } from '../../../utils/lane-git'
import { resolveDebussyPath } from '../../../utils/debussy'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  const recordId = await resolveRecordId(id)
  const record = await readLaneRecord(recordId)
  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lane ${id} not found`,
    })
  }

  const root = await resolveDebussyPath()
  const absWorktree = path.resolve(root, record.worktreePath)

  // Graceful cleanup — skip steps that fail
  try {
    await removeWorktree(absWorktree)
  } catch {
    // worktree may not exist
  }

  if (record.prNumber) {
    try {
      await closePR(record.prNumber)
    } catch {
      // PR may already be closed/merged
    }
  }

  try {
    await deleteBranch(record.branch)
  } catch {
    // branch may not exist
  }

  await deleteLaneRecord(recordId)

  return { ok: true }
})
