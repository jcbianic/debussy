import type { LaneRecord } from '~/shared/types/lanes'
import {
  readLaneRecord,
  writeLaneRecord,
  writeScopeMd,
} from '../../utils/lane-store'
import {
  fetchIssue,
  createBranch,
  createWorktree,
  createDraftPR,
  initialCommit,
  removeWorktree,
  deleteBranch,
  slugify,
} from '../../utils/lane-git'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ issueNumber?: number }>(event)

  if (!body?.issueNumber || typeof body.issueNumber !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: 'issueNumber is required and must be a number',
    })
  }

  const id = String(body.issueNumber)

  // Check for existing lane
  const existing = await readLaneRecord(id)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Lane ${id} already exists`,
    })
  }

  // Fetch issue from GitHub
  let issue: Awaited<ReturnType<typeof fetchIssue>>
  try {
    issue = await fetchIssue(body.issueNumber)
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: `GitHub issue #${body.issueNumber} not found`,
    })
  }

  const slug = slugify(issue.title)
  const branch = `feature/${id}-${slug}`
  const worktreeRelPath = `.worktrees/${id}`

  // Rollback tracking
  const rollback: (() => Promise<void>)[] = []

  try {
    // 1. Create branch
    await createBranch(branch)
    rollback.push(() => deleteBranch(branch))

    // 2. Create worktree
    const absPath = await createWorktree(worktreeRelPath, branch)
    rollback.push(() => removeWorktree(absPath))

    // 3. Build scope content
    const scopeContent = [
      `# ${issue.title}`,
      '',
      `> Issue #${body.issueNumber}`,
      '',
      issue.body || '_No description provided._',
      '',
    ].join('\n')

    // 4. Initial commit in worktree so the branch diverges from main
    await initialCommit(absPath, scopeContent)

    // 5. Create draft PR (pushes branch first)
    const prNumber = await createDraftPR(
      branch,
      issue.title,
      `Closes #${body.issueNumber}\n\n${issue.body}`
    )

    // 6. Write lane record
    const now = new Date().toISOString()
    const record: LaneRecord = {
      id,
      issueNumber: body.issueNumber,
      issueTitle: issue.title,
      branch,
      worktreePath: worktreeRelPath,
      prNumber,
      state: 'created',
      createdAt: now,
      updatedAt: now,
    }
    await writeLaneRecord(record)

    // 7. Write scope.md to lane metadata
    await writeScopeMd(id, scopeContent)

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
})
